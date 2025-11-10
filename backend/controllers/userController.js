const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");
const multer = require("multer");
const path = require("path");

const User = db.User;
const UserProfile = db.UserProfile;
const EmailVerification = db.EmailVerification;

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
    require("fs").mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const uploadProfilePicture = upload.single('profilePicture');

// In-memory stores
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

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ====================== INITIATE REGISTRATION ======================
const initiateRegistration = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { name, email, password, role = "customer" } = req.body;

    if (!name || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password: password,
      role,
      isVerified: false
    }, { transaction });

    await UserProfile.create({
      userId: user.id
    }, { transaction });

    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await EmailVerification.create({
      email,
      verificationCode,
      verificationToken,
      expiresAt,
      userId: user.id
    }, { transaction });

    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationCode, 
      name
    );

    if (!emailResult.success) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email"
      });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: {
        verificationToken,
        email: email,
        expiresIn: "15 minutes"
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error initiating registration:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== VERIFY EMAIL ======================
const verifyEmail = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { email, verificationCode, verificationToken } = req.body;

    if (!email || !verificationCode || !verificationToken) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Email, verification code, and token are required"
      });
    }

    const verificationRecord = await EmailVerification.findOne({
      where: { 
        email,
        verificationToken,
        isUsed: false
      },
      transaction
    });

    if (!verificationRecord) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Invalid verification request"
      });
    }

    if (new Date() > verificationRecord.expiresAt) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Verification code has expired"
      });
    }

    if (verificationRecord.attempts >= 5) {
      await transaction.rollback();
      return res.status(429).json({
        success: false,
        error: "Too many verification attempts"
      });
    }

    if (verificationRecord.verificationCode !== verificationCode) {
      await verificationRecord.update({
        attempts: verificationRecord.attempts + 1
      }, { transaction });

      await transaction.commit();

      const attemptsLeft = 5 - (verificationRecord.attempts + 1);
      return res.status(400).json({
        success: false,
        error: `Invalid verification code. ${attemptsLeft} attempts remaining.`
      });
    }

    const user = await User.findByPk(verificationRecord.userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await user.update({
      isVerified: true
    }, { transaction });

    await verificationRecord.update({
      isUsed: true,
      attempts: verificationRecord.attempts + 1
    }, { transaction });

    await emailService.sendWelcomeEmail(user.email, user.name);

    const tokens = generateTokens(user);

    await transaction.commit();

    const userWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      data: {
        user: userWithProfile,
        ...tokens
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== LOGIN ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password" 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in",
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
    }

    const tokens = generateTokens(user);

    const userWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithProfile,
        ...tokens
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ====================== GET PROFILE ======================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userWithProfile = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    if (!userWithProfile) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    res.json({
      success: true,
      data: userWithProfile
    });
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ====================== UPDATE PROFILE ======================
const updateProfile = async (req, res) => {
  try {
    uploadProfilePicture(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      const userId = req.user.id;
      const {
        phone,
        age,
        country,
        city,
        address,
        postalCode,
        dateOfBirth,
        gender
      } = req.body;

      try {
        let userProfile = await UserProfile.findOne({ where: { userId } });

        const updateData = {};
        if (phone !== undefined) updateData.phone = phone;
        if (age !== undefined) updateData.age = age;
        if (country !== undefined) updateData.country = country;
        if (city !== undefined) updateData.city = city;
        if (address !== undefined) updateData.address = address;
        if (postalCode !== undefined) updateData.postalCode = postalCode;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updateData.gender = gender;

        if (req.file) {
          updateData.profilePicture = req.file.filename;
        }

        if (userProfile) {
          await userProfile.update(updateData);
        } else {
          updateData.userId = userId;
          userProfile = await UserProfile.create(updateData);
        }

        const updatedProfile = await UserProfile.findOne({
          where: { userId },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role', 'isVerified']
          }]
        });

        res.json({
          success: true,
          message: "Profile updated successfully",
          data: updatedProfile
        });

      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== GET USER ORDERS ======================
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const { count, rows: orders } = await db.Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.OrderItem,
          as: 'items',
          include: [{
            model: db.Product,
            as: 'product',
            attributes: ['id', 'title', 'sku', 'mainImage']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ====================== UPDATE USER ======================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (req.user.id != id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You can only update your own profile"
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    if (name || email) {
      const conflictUser = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            name ? { name } : {},
            email ? { email } : {},
          ],
          id: { [db.Sequelize.Op.ne]: id },
        },
      });
      if (conflictUser) {
        return res.status(400).json({
          success: false,
          error: "Another user with this name or email already exists",
        });
      }
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
    });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [{
        model: UserProfile,
        as: 'profile'
      }]
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ====================== DELETE USER ======================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.id != id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own account"
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    await user.destroy();
    res.json({ 
      success: true,
      message: "User deleted successfully" 
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ====================== REFRESH TOKEN ======================
const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "No token provided" 
    });
  }
  
  if (!refreshTokens.includes(token)) {
    return res.status(403).json({ 
      success: false,
      error: "Invalid refresh token" 
    });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: "Invalid refresh token" 
      });
    }

    const tokens = generateTokens(user);
    res.json({
      success: true,
      data: tokens
    });
  });
};

// ====================== LOGOUT ======================
const logout = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) tokenBlacklist.push(token);

  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  }

  res.json({ 
    success: true,
    message: "Logout successful" 
  });
};

// ====================== RESEND VERIFICATION ======================
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified"
      });
    }

    const verificationCode = generateVerificationCode();
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await EmailVerification.create({
      email,
      verificationCode,
      verificationToken,
      expiresAt,
      userId: user.id
    });

    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationCode, 
      user.name
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send verification email"
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent",
      data: {
        verificationToken,
        email: email,
        expiresIn: "15 minutes"
      }
    });

  } catch (error) {
    console.error("Error resending verification:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  initiateRegistration,
  verifyEmail,
  login,
  getProfile,
  updateProfile,
  getUserOrders,
  updateUser,
  deleteUser,
  refreshToken,
  logout,
  resendVerificationCode,
  tokenBlacklist
};