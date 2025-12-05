import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
