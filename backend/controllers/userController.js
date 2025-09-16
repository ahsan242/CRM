// const db = require("../config/db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const User = db.User;

// // In-memory stores (for demo, in production use Redis or DB)
// let tokenBlacklist = [];
// let refreshTokens = [];

// // Generate tokens
// const generateTokens = (user) => {
//   const accessToken = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "15m" }
//   );

//   const refreshToken = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.JWT_REFRESH_SECRET,
//     { expiresIn: "7d" }
//   );

//   refreshTokens.push(refreshToken);
//   return { accessToken, refreshToken };
// };

// // Register
// // exports.register = async (req, res) => {
// //   try {
// //     const { name, email, password, role } = req.body;

// //     const existingUser = await User.findOne({ where: { email } });
// //     if (existingUser) {
// //       return res.status(400).json({ error: "Email already registered" });
// //     }

// //     const user = await User.create({ name, email, password, role });
// //     res.status(201).json({ message: "User registered successfully", user });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };
// // Register
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // check existing user
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     // hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // create user with hashed password
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     // send clean response (don’t send password back)
//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };



// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

//     const tokens = generateTokens(user);

//     res.json({ message: "Login successful", ...tokens });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Refresh token
// exports.refreshToken = (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(401).json({ error: "No token provided" });
//   if (!refreshTokens.includes(token)) {
//     return res.status(403).json({ error: "Invalid refresh token" });
//   }

//   jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: "Invalid refresh token" });

//     const tokens = generateTokens(user);
//     res.json(tokens);
//   });
// };

// // Logout
// exports.logout = (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (token) tokenBlacklist.push(token);

//   const { refreshToken } = req.body;
//   if (refreshToken) {
//     refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
//   }

//   res.json({ message: "Logout successful, tokens invalidated" });
// };

// // Get profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id, {
//       attributes: { exclude: ["password"] },
//     });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update user
// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     await user.update(req.body);
//     res.json({ message: "User updated successfully", user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete user
// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     await user.destroy();
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.tokenBlacklist = tokenBlacklist;

const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = db.User;

// In-memory stores (for demo, in production use Redis or DB)
let tokenBlacklist = [];
let refreshTokens = [];

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  refreshTokens.push(refreshToken);
  return { accessToken, refreshToken };
};

// ====================== Register ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check existing user by name or email
    const existingUser = await User.findOne({
      where: { [db.Sequelize.Op.or]: [{ email }, { name }] },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this name or email already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ====================== Login ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = generateTokens(user);

    res.json({ message: "Login successful", ...tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== Refresh Token ======================
exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "No token provided" });
  if (!refreshTokens.includes(token)) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const tokens = generateTokens(user);
    res.json(tokens);
  });
};

// ====================== Logout ======================
exports.logout = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) tokenBlacklist.push(token);

  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  }

  res.json({ message: "Logout successful, tokens invalidated" });
};

// ====================== Get Profile ======================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== Update User ======================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // check if new name or email is already used by another user
    if (name || email) {
      const conflictUser = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            name ? { name } : {},
            email ? { email } : {},
          ],
          id: { [db.Sequelize.Op.ne]: id }, // exclude current user
        },
      });
      if (conflictUser) {
        return res.status(400).json({
          error: "Another user with this name or email already exists",
        });
      }
    }

    // hash password if being updated
    let hashedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      password: hashedPassword,
      role: role ?? user.role,
    });

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ====================== Delete User ======================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.tokenBlacklist = tokenBlacklist;
