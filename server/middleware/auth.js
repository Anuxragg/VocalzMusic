const User = require('../models/User');
const { verifyAccessToken } = require('../config/jwt');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id || decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const optionalProtect = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id || decoded.userId).select('-password');
  } catch (error) {
    req.user = null;
  }

  return next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
};

const artistOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'artist' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Artist access required' });
  }
  return next();
};

module.exports = { protect, optionalProtect, adminOnly, artistOnly };
