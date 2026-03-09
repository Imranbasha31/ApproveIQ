import { Router } from 'express';
import { getPool } from '../db/connection.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const CreateLeaveSchema = z.object({
  leave_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string(),
});

// Mock data (fallback when DB unavailable)
const mockLeaves: any[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    student_name: 'Alice Johnson',
    leave_type: 'medical',
    start_date: '2026-03-15',
    end_date: '2026-03-17',
    reason: 'Medical appointment',
    status: 'pending',
    current_stage: 1,
    created_at: '2026-03-08T10:00:00Z',
    updated_at: '2026-03-08T10:00:00Z',
  },
];

// Get leaves (filtered by role)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const pool = getPool();

    if (req.user?.role === 'student') {
      const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
          SELECT lr.*, u.name as student_name
          FROM LeaveRequests lr
          JOIN Users u ON lr.student_id = u.id
          WHERE lr.student_id = @userId
          ORDER BY lr.created_at DESC
        `);
      res.json(result.recordset);
    } else {
      const result = await pool.request().query(`
        SELECT lr.*, u.name as student_name
        FROM LeaveRequests lr
        JOIN Users u ON lr.student_id = u.id
        ORDER BY lr.created_at DESC
      `);
      res.json(result.recordset);
    }
  } catch (error) {
    // Fall back to mock data
    console.log('DB unavailable, using mock leaves');
    if (req.user?.role === 'student') {
      const filtered = mockLeaves.filter(l => l.student_id === req.user?.id);
      res.json(filtered);
    } else {
      res.json(mockLeaves);
    }
  }
});

// Create leave request
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = CreateLeaveSchema.parse(req.body);
    const pool = getPool();

    await pool.request()
      .input('student_id', req.user?.id)
      .input('leave_type', data.leave_type)
      .input('start_date', data.start_date)
      .input('end_date', data.end_date)
      .input('reason', data.reason)
      .query(`
        INSERT INTO LeaveRequests (student_id, leave_type, start_date, end_date, reason, status)
        VALUES (@student_id, @leave_type, @start_date, @end_date, @reason, 'pending')
      `);

    res.status(201).json({ message: 'Leave request created successfully' });
  } catch (error) {
    console.error('Leave creation error:', error);
    
    // Try to parse the request body for mock data fallback
    try {
      const data = CreateLeaveSchema.parse(req.body);
      const newLeave = {
        id: Math.random().toString(36).substr(2, 9),
        student_id: req.user?.id,
        student_name: req.user?.name,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        status: 'pending',
        current_stage: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockLeaves.push(newLeave);
      console.log('Leave created with mock data:', newLeave);
      res.status(201).json({ message: 'Leave request created successfully (mock)', id: newLeave.id });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      res.status(400).json({ error: 'Invalid request data. Please check your inputs.' });
    }
  }
});

// Approve/Reject leave
router.put('/:id/approve', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status, current_stage, comments } = req.body;
    const pool = getPool();

    await pool.request()
      .input('id', req.params.id)
      .input('status', status)
      .input('current_stage', current_stage || 1)
      .input('updated_at', new Date())
      .query(
        'UPDATE LeaveRequests SET status = @status, current_stage = @current_stage, updated_at = @updated_at WHERE id = @id'
      );

    res.json({ message: 'Leave request updated successfully' });
  } catch (error) {
    // Fall back to mock data update
    const leave = mockLeaves.find(l => l.id === req.params.id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    leave.status = req.body.status;
    leave.current_stage = req.body.current_stage || leave.current_stage;
    leave.updated_at = new Date().toISOString();
    console.log('Leave updated (mock):', leave);
    res.json({ message: 'Leave request updated successfully (mock)' });
  }
});

export default router;
