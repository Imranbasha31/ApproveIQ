import { Router } from 'express';
import { getPool } from '../db/connection.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

// Mock users data (fallback when DB unavailable)
const MOCK_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'student1',
    name: 'Alice Johnson',
    email: 'alice@college.edu',
    department: 'Computer Science',
    role: 'student',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'advisor1',
    name: 'Prof. Smith',
    email: 'smith@college.edu',
    department: 'Computer Science',
    role: 'advisor',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'hod1',
    name: 'Dr. Brown',
    email: 'brown@college.edu',
    department: 'Computer Science',
    role: 'hod',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    username: 'principal1',
    name: 'Principal Lee',
    email: 'lee@college.edu',
    department: 'Administration',
    role: 'principal',
  },
];

// Get current user from auth headers
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Get all users
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(
      'SELECT id, username, name, email, department, role FROM Users'
    );
    res.json(result.recordset);
  } catch (error) {
    // Fall back to mock data
    console.log('DB unavailable, using mock users');
    res.json(MOCK_USERS);
  }
});

export default router;
