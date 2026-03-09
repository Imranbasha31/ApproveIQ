import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './db/connection.js';
import usersRouter from './routes/users.js';
import leavesRouter from './routes/leaves.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/leaves', leavesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server (DB connection is optional)
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.log('ℹ DB not available, using mock data');
  }
  
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

start();

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});
