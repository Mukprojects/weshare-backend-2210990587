const passport = require('../config/passport');

// JWT Authentication middleware
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Optional JWT Authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Optional auth error:', err);
    }
    
    if (user) {
      req.user = user;
    }
    
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT,
  optionalAuth
};