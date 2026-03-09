import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // In production, validate Windows auth or JWT token
    // For now, get user from header (will be set by frontend)
    const userId = req.headers['x-user-id'] as string;
    const username = req.headers['x-username'] as string;

    if (!userId || !username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: userId,
      username: username,
      name: req.headers['x-user-name'] as string || username,
      role: req.headers['x-user-role'] as string || 'student',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
