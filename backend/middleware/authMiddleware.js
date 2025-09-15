const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("../controllers/userController");

exports.protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ error: "Token expired, please login again" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = decoded;
    next();
  });
};
