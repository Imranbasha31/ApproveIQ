import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_USERS_FILE = path.join(__dirname, '../../data/users.json');

// Default mock users
const DEFAULT_USERS = [
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
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    username: 'admin',
    name: 'System Administrator',
    email: 'bashaimran021@gmail.com',
    department: 'IT Administration',
    role: 'admin',
  },
];

function loadMockUsers() {
  try {
    if (fs.existsSync(MOCK_USERS_FILE)) {
      return JSON.parse(fs.readFileSync(MOCK_USERS_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  saveMockUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveMockUsers(data) {
  try {
    const dir = path.dirname(MOCK_USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MOCK_USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving users:', e.message);
  }
}

let mockUsers = loadMockUsers();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if requester is admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const pool = getPool();
      const result = await pool.request()
        .input('email', email)
        .query('SELECT id, username, name, email, department, role, password FROM Users WHERE email=@email');
      
      if (result.recordset.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.recordset[0];
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { password: _, ...userData } = user;
      return res.json(userData);
    } catch (dbError) {
      // Fallback to mock users
      const user = mockUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user || (user.password && user.password !== password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const { password: _, ...userData } = user;
      return res.json(userData);
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user from auth headers
router.get('/me', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(
      'SELECT id, username, name, email, department, role FROM Users'
    );
    res.json(result.recordset);
  } catch (error) {
    console.log('DB unavailable, using mock users');
    res.json(mockUsers);
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, department, username, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const pool = getPool();
    const result = await pool.request()
      .input('username', username || email.split('@')[0])
      .input('name', name)
      .input('email', email)
      .input('department', department || null)
      .input('role', role)
      .input('password', password || 'password')
      .query(`
        INSERT INTO Users (username, name, email, department, role, password)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.name, INSERTED.email, INSERTED.department, INSERTED.role
        VALUES (@username, @name, @email, @department, @role, @password)
      `);
    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Create user error:', error.message);
    if (error.message?.includes('UQ__Users') || error.message?.includes('UNIQUE KEY') || error.message?.includes('duplicate')) {
      return res.status(409).json({ error: 'A user with that username already exists. Please choose a different username.' });
    }
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const userId = req.params.id;

    const pool = getPool();
    const result = await pool.request()
      .input('id', userId)
      .input('name', name)
      .input('email', email)
      .input('department', department || null)
      .input('role', role)
      .query('UPDATE Users SET name=@name, email=@email, department=@department, role=@role WHERE id=@id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    const pool = getPool();
    const result = await pool.request()
      .input('id', userId)
      .query('DELETE FROM Users WHERE id=@id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

export default router;
