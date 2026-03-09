export function authMiddleware(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const username = req.headers['x-username'];

    if (!userId || !username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: userId,
      username: username,
      name: req.headers['x-user-name'] || username,
      role: req.headers['x-user-role'] || 'student',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
