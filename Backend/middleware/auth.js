const jwt = require('jsonwebtoken');

// Secret key for JWT signing (should be in .env in production)
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to authenticate token
exports.authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Add user information to request object
    req.user = user;
    next();
  });
};

// Generate a token for a user
exports.generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}; 