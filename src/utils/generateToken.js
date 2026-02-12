const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign(
    { 
      userId,
      timestamp: Date.now() 
    },
    process.env.JWT_SECRET || 'clau_secreta_per_defecte',
    { expiresIn: '7d' } // Token expira en 7 dies
  );
}