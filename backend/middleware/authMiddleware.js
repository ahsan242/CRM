
// const jwt = require("jsonwebtoken");
// const { tokenBlacklist } = require("../controllers/userController");

// const protect = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ 
//       success: false,
//       error: "No token provided" 
//     });
//   }

//   if (tokenBlacklist.includes(token)) {
//     return res.status(401).json({ 
//       success: false,
//       error: "Token expired, please login again" 
//     });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ 
//         success: false,
//         error: "Invalid token" 
//       });
//     }

//     req.user = decoded;
//     next();
//   });
// };

// module.exports = { protect };
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = db.User;

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'boss')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { protect, admin };