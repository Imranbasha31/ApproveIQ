import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getPool } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DATA_FILE = path.join(__dirname, '../../data/leaves.json');
const MOCK_USERS_FILE = path.join(__dirname, '../../data/users.json');
const PROOF_FILES_MAP = path.join(__dirname, '../../data/proof-files.json');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  },
});

// Ensure data directory exists
const dataDir = path.dirname(MOCK_DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save mock data to file
function saveMockData(data) {
  try {
    fs.writeFileSync(MOCK_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('💾 Mock leaves saved to file');
  } catch (error) {
    console.error('Error saving mock data:', error.message);
  }
}

// Default mock data
const defaultLeaves = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    student_name: 'Alice Johnson',
    leave_type: 'medical',
    start_date: '2026-03-15',
    end_date: '2026-03-17',
    reason: 'Medical appointment',
    status: 'pending',
    created_at: '2026-03-08T10:00:00Z',
    updated_at: '2026-03-08T10:00:00Z',
  },
];

// Load initial mock data from file or use default
let mockLeaves = (() => {
  try {
    if (fs.existsSync(MOCK_DATA_FILE)) {
      const data = fs.readFileSync(MOCK_DATA_FILE, 'utf8');
      console.log('📂 Loaded mock leaves from file');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading mock data:', error.message);
  }

  // Use default and save
  saveMockData(defaultLeaves);
  return defaultLeaves;
})();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function loadMockUsers() {
  try {
    if (fs.existsSync(MOCK_USERS_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_USERS_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return [];
}

function enrichLeavesWithDepartment(leaves) {
  const users = loadMockUsers();
  return leaves.map(l => {
    if (!l.department) {
      const student = users.find(u => u.id === l.student_id);
      return { ...l, department: student?.department || '' };
    }
    return l;
  });
}

// Proof file mapping (leaveId -> filename)
function loadProofFiles() {
  try {
    if (fs.existsSync(PROOF_FILES_MAP)) {
      return JSON.parse(fs.readFileSync(PROOF_FILES_MAP, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return {};
}

function saveProofFile(leaveId, filename) {
  const map = loadProofFiles();
  map[leaveId.toLowerCase()] = filename;
  try {
    fs.writeFileSync(PROOF_FILES_MAP, JSON.stringify(map, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving proof file map:', e.message);
  }
}

function enrichLeavesWithProofFiles(leaves) {
  const map = loadProofFiles();
  return leaves.map(l => {
    const proofFile = map[l.id?.toLowerCase?.()] || l.proof_file || null;
    return { ...l, proof_file: proofFile };
  });
}

// Export leaves as CSV (admin only)
router.get('/export/csv', authMiddleware, async (req, res) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'principal') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    let rows;
    try {
      const pool = getPool();
      const result = await pool.request().query(`
        SELECT lr.id, u.name as student_name, lr.leave_type, lr.start_date, lr.end_date,
               lr.reason, lr.status, lr.current_stage, lr.created_at
        FROM LeaveRequests lr
        JOIN Users u ON lr.student_id = u.id
        ORDER BY lr.created_at DESC
      `);
      rows = result.recordset;
    } catch (dbError) {
      console.log('DB unavailable for CSV export, using mock data');
      rows = mockLeaves;
    }

    const csvHeader = 'ID,Student Name,Leave Type,Start Date,End Date,Reason,Status,Stage,Created At';
    const csvRows = rows.map((r) =>
      [
        r.id,
        `"${(r.student_name || '').replace(/"/g, '""')}"`,
        r.leave_type,
        r.start_date,
        r.end_date,
        `"${(r.reason || '').replace(/"/g, '""')}"`,
        r.status,
        r.current_stage || '',
        r.created_at,
      ].join(',')
    );

    const csv = [csvHeader, ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leave_requests.csv');
    return res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Get leaves (filtered by role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    try {
      const pool = getPool();

      if (req.user?.role === 'student') {
        const result = await pool.request()
          .input('userId', req.user.id)
          .query(`
            SELECT lr.*, u.name as student_name, u.department as department
            FROM LeaveRequests lr
            JOIN Users u ON lr.student_id = u.id
            WHERE lr.student_id = @userId
            ORDER BY lr.created_at DESC
          `);
        return res.json(enrichLeavesWithProofFiles(result.recordset));
      } else {
        const result = await pool.request().query(`
          SELECT lr.*, u.name as student_name, u.department as department
          FROM LeaveRequests lr
          JOIN Users u ON lr.student_id = u.id
          ORDER BY lr.created_at DESC
        `);
        return res.json(enrichLeavesWithProofFiles(result.recordset));
      }
    } catch (dbError) {
      // Database unavailable, return mock data
      console.log('DB unavailable for get, using mock data:', dbError.message);
      
      if (req.user?.role === 'student') {
        const filtered = mockLeaves.filter(l => l.student_id === req.user?.id);
        console.log(`Returning ${filtered.length} mock leaves for student ${req.user.id}`);
        return res.json(enrichLeavesWithProofFiles(enrichLeavesWithDepartment(filtered)));
      } else {
        console.log(`Returning ${mockLeaves.length} mock leaves for admin`);
        return res.json(enrichLeavesWithProofFiles(enrichLeavesWithDepartment(mockLeaves)));
      }
    }
  } catch (error) {
    console.error('Get leaves error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// Create leave request
router.post('/', authMiddleware, upload.single('proof_file'), async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const proofFile = req.file ? req.file.filename : null;

    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const pool = getPool();
      const result = await pool.request()
        .input('student_id', req.user.id)
        .input('leave_type', leave_type)
        .input('start_date', start_date)
        .input('end_date', end_date)
        .input('reason', reason)
        .query(`
          INSERT INTO LeaveRequests (student_id, leave_type, start_date, end_date, reason, status)
          OUTPUT INSERTED.id
          VALUES (@student_id, @leave_type, @start_date, @end_date, @reason, 'pending')
        `);

      // Save proof file mapping if file was uploaded
      if (proofFile && result.recordset && result.recordset[0]) {
        saveProofFile(result.recordset[0].id, proofFile);
      }

      return res.status(201).json({ message: 'Leave request created successfully in database' });
    } catch (dbError) {
      // Database unavailable, use mock data
      console.log('DB unavailable for create, using mock storage:', dbError.message);
      
      const newLeave = {
        id: generateUUID(),
        student_id: req.user.id,
        student_name: req.user.name || 'Unknown Student',
        leave_type,
        start_date,
        end_date,
        reason,
        proof_file: proofFile,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockLeaves.push(newLeave);
      saveMockData(mockLeaves);
      console.log('Leave saved to mock storage. Total leaves:', mockLeaves.length);
      
      return res.status(201).json({ 
        message: 'Leave request created successfully (saved to file)', 
        id: newLeave.id,
        stored_in: 'mock'
      });
    }
  } catch (error) {
    console.error('Leave creation error:', error);
    return res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// Approve/Reject leave
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { status, current_stage, comments } = req.body;
    const leaveId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    try {
      const pool = getPool();

      const request = pool.request()
        .input('id', leaveId)
        .input('status', status)
        .input('updated_at', new Date());

      if (current_stage !== undefined) {
        request.input('current_stage', current_stage);
        await request.query(
          'UPDATE LeaveRequests SET status = @status, current_stage = @current_stage, updated_at = @updated_at WHERE id = @id'
        );
      } else {
        await request.query(
          'UPDATE LeaveRequests SET status = @status, updated_at = @updated_at WHERE id = @id'
        );
      }

      return res.json({ message: 'Leave request updated successfully in database' });
    } catch (dbError) {
      // Database unavailable, update mock data
      console.log('DB unavailable for update, using mock storage:', dbError.message);
      
      const leave = mockLeaves.find(l => l.id === leaveId);
      if (!leave) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      leave.status = status;
      if (current_stage !== undefined) {
        leave.current_stage = current_stage;
      }
      leave.updated_at = new Date().toISOString();
      saveMockData(mockLeaves);
      console.log(`Leave ${leaveId} updated to status=${status}, stage=${current_stage}`);
      
      return res.json({ 
        message: 'Leave request updated successfully (saved to file)',
        stored_in: 'mock'
      });
    }
  } catch (error) {
    console.error('Leave update error:', error);
    return res.status(500).json({ error: 'Failed to update leave request' });
  }
});

export default router;
