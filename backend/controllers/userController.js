
// // const db = require("../config/db");
// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");
// // const crypto = require("crypto");
// // const emailService = require("../services/emailService");

// // const User = db.User;
// // const EmailVerification = db.EmailVerification;

// // // In-memory stores (for demo, in production use Redis or DB)
// // let tokenBlacklist = [];
// // let refreshTokens = [];

// // // Generate tokens
// // const generateTokens = (user) => {
// //   const accessToken = jwt.sign(
// //     { id: user.id, email: user.email, role: user.role },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "15m" }
// //   );

// //   const refreshToken = jwt.sign(
// //     { id: user.id, email: user.email, role: user.role },
// //     process.env.JWT_REFRESH_SECRET,
// //     { expiresIn: "7d" }
// //   );

// //   refreshTokens.push(refreshToken);
// //   return { accessToken, refreshToken };
// // };

// // // Generate verification code
// // const generateVerificationCode = () => {
// //   return Math.floor(100000 + Math.random() * 900000).toString();
// // };

// // // Generate verification token
// // const generateVerificationToken = () => {
// //   return crypto.randomBytes(32).toString('hex');
// // };

// // // ====================== INITIATE REGISTRATION ======================
// // exports.initiateRegistration = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { name, email, password, role = "customer" } = req.body;

// //     // Validate input
// //     if (!name || !email || !password) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Name, email, and password are required"
// //       });
// //     }

// //     // Check if user already exists
// //     const existingUser = await User.findOne({
// //       where: { 
// //         [db.Sequelize.Op.or]: [{ email }, { name }] 
// //       },
// //       transaction
// //     });

// //     if (existingUser) {
// //       await transaction.rollback();
      
// //       if (existingUser.isVerified) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "User with this email or name already exists"
// //         });
// //       } else {
// //         return res.status(400).json({
// //           success: false,
// //           error: "An unverified account with this email already exists. Please verify your email or use a different email."
// //         });
// //       }
// //     }

// //     // Check for recent verification attempts
// //     const recentAttempt = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         expiresAt: { [db.Sequelize.Op.gt]: new Date() },
// //         isUsed: false
// //       },
// //       transaction
// //     });

// //     if (recentAttempt) {
// //       const timeLeft = Math.ceil((new Date(recentAttempt.expiresAt) - new Date()) / 1000 / 60);
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: `Verification code already sent. Please wait ${timeLeft} minutes before requesting a new code.`
// //       });
// //     }

// //     // Hash password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // Create unverified user
// //     const user = await User.create({
// //       name,
// //       email,
// //       password: hashedPassword,
// //       role,
// //       isVerified: false
// //     }, { transaction });

// //     // Generate verification code and token
// //     const verificationCode = generateVerificationCode();
// //     const verificationToken = generateVerificationToken();
// //     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

// //     // Create verification record
// //     await EmailVerification.create({
// //       email,
// //       verificationCode,
// //       verificationToken,
// //       expiresAt,
// //       userId: user.id
// //     }, { transaction });

// //     // Send verification email
// //     const emailResult = await emailService.sendVerificationEmail(
// //       email, 
// //       verificationCode, 
// //       name
// //     );

// //     if (!emailResult.success) {
// //       await transaction.rollback();
// //       return res.status(500).json({
// //         success: false,
// //         error: "Failed to send verification email. Please try again."
// //       });
// //     }

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "Verification code sent to your email",
// //       data: {
// //         verificationToken,
// //         email: email,
// //         expiresIn: "15 minutes"
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error initiating registration:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== VERIFY EMAIL ======================
// // exports.verifyEmail = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { email, verificationCode, verificationToken } = req.body;

// //     if (!email || !verificationCode || !verificationToken) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email, verification code, and token are required"
// //       });
// //     }

// //     // Find verification record
// //     const verificationRecord = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         verificationToken,
// //         isUsed: false
// //       },
// //       include: [{
// //         model: User,
// //         as: 'user',
// //         attributes: ['id', 'name', 'email', 'isVerified']
// //       }],
// //       transaction
// //     });

// //     if (!verificationRecord) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Invalid verification request. Please request a new verification code."
// //       });
// //     }

// //     // Check if code is expired
// //     if (new Date() > verificationRecord.expiresAt) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Verification code has expired. Please request a new one."
// //       });
// //     }

// //     // Check attempt limits
// //     if (verificationRecord.attempts >= 5) {
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: "Too many verification attempts. Please request a new code."
// //       });
// //     }

// //     // Verify code
// //     if (verificationRecord.verificationCode !== verificationCode) {
// //       await verificationRecord.update({
// //         attempts: verificationRecord.attempts + 1
// //       }, { transaction });

// //       await transaction.commit();

// //       const attemptsLeft = 5 - (verificationRecord.attempts + 1);
// //       return res.status(400).json({
// //         success: false,
// //         error: `Invalid verification code. ${attemptsLeft} attempts remaining.`
// //       });
// //     }

// //     // Get user
// //     const user = await User.findByPk(verificationRecord.userId, { transaction });
// //     if (!user) {
// //       await transaction.rollback();
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found"
// //       });
// //     }

// //     if (user.isVerified) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is already verified"
// //       });
// //     }

// //     // Mark user as verified and update verification record
// //     await user.update({
// //       isVerified: true,
// //       verificationToken: null,
// //       verificationTokenExpires: null
// //     }, { transaction });

// //     await verificationRecord.update({
// //       isUsed: true,
// //       attempts: verificationRecord.attempts + 1
// //     }, { transaction });

// //     // Send welcome email
// //     await emailService.sendWelcomeEmail(user.email, user.name);

// //     // Generate tokens
// //     const tokens = generateTokens(user);

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "Email verified successfully! Your account is now active.",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: true
// //         },
// //         ...tokens
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error verifying email:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== RESEND VERIFICATION CODE ======================
// // exports.resendVerificationCode = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is required"
// //       });
// //     }

// //     // Find user
// //     const user = await User.findOne({
// //       where: { email },
// //       transaction
// //     });

// //     if (!user) {
// //       await transaction.rollback();
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found with this email"
// //       });
// //     }

// //     if (user.isVerified) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is already verified"
// //       });
// //     }

// //     // Check for recent attempts
// //     const recentAttempt = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         expiresAt: { [db.Sequelize.Op.gt]: new Date() },
// //         isUsed: false
// //       },
// //       transaction
// //     });

// //     if (recentAttempt) {
// //       const timeLeft = Math.ceil((new Date(recentAttempt.expiresAt) - new Date()) / 1000 / 60);
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: `Please wait ${timeLeft} minutes before requesting a new verification code.`
// //       });
// //     }

// //     // Generate new verification code and token
// //     const verificationCode = generateVerificationCode();
// //     const verificationToken = generateVerificationToken();
// //     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

// //     // Create new verification record
// //     await EmailVerification.create({
// //       email,
// //       verificationCode,
// //       verificationToken,
// //       expiresAt,
// //       userId: user.id
// //     }, { transaction });

// //     // Send verification email
// //     const emailResult = await emailService.sendVerificationEmail(
// //       email, 
// //       verificationCode, 
// //       user.name
// //     );

// //     if (!emailResult.success) {
// //       await transaction.rollback();
// //       return res.status(500).json({
// //         success: false,
// //         error: "Failed to send verification email. Please try again."
// //       });
// //     }

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "New verification code sent to your email",
// //       data: {
// //         verificationToken,
// //         email: email,
// //         expiresIn: "15 minutes"
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error resending verification code:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== LOGIN (ENHANCED DEBUGGING) ======================
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     console.log('🔍 LOGIN ATTEMPT:', { email });

// //     const user = await User.findOne({ where: { email } });
    
// //     if (!user) {
// //       console.log('❌ USER NOT FOUND:', email);
// //       return res.status(401).json({  // Changed from 404 to 401
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     console.log('🔍 USER DETAILS:', {
// //       id: user.id,
// //       email: user.email,
// //       isVerified: user.isVerified,
// //       passwordLength: user.password ? user.password.length : 'no password',
// //       createdAt: user.createdAt
// //     });

// //     // Check if email is verified
// //     if (!user.isVerified) {
// //       console.log('❌ EMAIL NOT VERIFIED:', user.email);
// //       return res.status(403).json({
// //         success: false,
// //         error: "Please verify your email before logging in. Check your inbox for the verification code.",
// //         requiresVerification: true,
// //         email: user.email
// //       });
// //     }

// //     // Debug password comparison
// //     console.log('🔍 PASSWORD COMPARISON:', {
// //       providedPassword: password ? '***' : 'missing',
// //       storedPassword: user.password ? '***' : 'missing'
// //     });

// //     // Check if user has a password (for users created via other methods)
// //     if (!user.password) {
// //       console.log('❌ NO PASSWORD SET for user:', user.email);
// //       return res.status(401).json({ 
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     console.log('🔍 PASSWORD MATCH RESULT:', isMatch);

// //     if (!isMatch) {
// //       console.log('❌ PASSWORD MISMATCH for user:', user.email);
// //       return res.status(401).json({ 
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     // Generate tokens
// //     const tokens = generateTokens(user);
// //     console.log('✅ LOGIN SUCCESSFUL:', { email: user.email, tokensGenerated: true });

// //     // Send proper response format
// //     res.status(200).json({
// //       success: true,
// //       message: "Login successful",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: user.isVerified
// //         },
// //         ...tokens
// //       }
// //     });

// //   } catch (err) {
// //     console.error('❌ LOGIN ERROR:', err);
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== GET PROFILE (UPDATED) ======================
// // exports.getProfile = async (req, res) => {
// //   try {
// //     const user = await User.findByPk(req.user.id, {
// //       attributes: { exclude: ["password"] },
// //     });
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       data: user
// //     });
// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== UPDATE USER (UPDATED) ======================
// // exports.updateUser = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { name, email, password, role } = req.body;

// //     const user = await User.findByPk(id);
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     // check if new name or email is already used by another user
// //     if (name || email) {
// //       const conflictUser = await User.findOne({
// //         where: {
// //           [db.Sequelize.Op.or]: [
// //             name ? { name } : {},
// //             email ? { email } : {},
// //           ],
// //           id: { [db.Sequelize.Op.ne]: id }, // exclude current user
// //         },
// //       });
// //       if (conflictUser) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "Another user with this name or email already exists",
// //         });
// //       }
// //     }

// //     // hash password if being updated
// //     let hashedPassword = user.password;
// //     if (password) {
// //       const salt = await bcrypt.genSalt(10);
// //       hashedPassword = await bcrypt.hash(password, salt);
// //     }

// //     await user.update({
// //       name: name ?? user.name,
// //       email: email ?? user.email,
// //       password: hashedPassword,
// //       role: role ?? user.role,
// //     });

// //     res.json({
// //       success: true,
// //       message: "User updated successfully",
// //       data: {
// //         id: user.id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         isVerified: user.isVerified
// //       },
// //     });

// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== DELETE USER (UPDATED) ======================
// // exports.deleteUser = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const user = await User.findByPk(id);
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     await user.destroy();
// //     res.json({ 
// //       success: true,
// //       message: "User deleted successfully" 
// //     });

// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== REFRESH TOKEN ======================
// // exports.refreshToken = (req, res) => {
// //   const { token } = req.body;
// //   if (!token) {
// //     return res.status(401).json({ 
// //       success: false,
// //       error: "No token provided" 
// //     });
// //   }
  
// //   if (!refreshTokens.includes(token)) {
// //     return res.status(403).json({ 
// //       success: false,
// //       error: "Invalid refresh token" 
// //     });
// //   }

// //   jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
// //     if (err) {
// //       return res.status(403).json({ 
// //         success: false,
// //         error: "Invalid refresh token" 
// //       });
// //     }

// //     const tokens = generateTokens(user);
// //     res.json({
// //       success: true,
// //       data: tokens
// //     });
// //   });
// // };

// // // ====================== LOGOUT ======================
// // exports.logout = (req, res) => {
// //   const token = req.headers["authorization"]?.split(" ")[1];
// //   if (token) tokenBlacklist.push(token);

// //   const { refreshToken } = req.body;
// //   if (refreshToken) {
// //     refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
// //   }

// //   res.json({ 
// //     success: true,
// //     message: "Logout successful, tokens invalidated" 
// //   });
// // };

// // // ====================== DEBUG LOGIN ======================
// // exports.debugLogin = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
    
// //     console.log('🔍 DEBUG LOGIN ATTEMPT:', { email });
    
// //     const user = await User.findOne({ where: { email } });
// //     console.log('🔍 USER FOUND:', user ? {
// //       id: user.id,
// //       email: user.email,
// //       isVerified: user.isVerified,
// //       passwordExists: !!user.password
// //     } : 'USER NOT FOUND');

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found",
// //         debug: { email, userFound: false }
// //       });
// //     }

// //     // Check if email is verified
// //     if (!user.isVerified) {
// //       return res.status(403).json({
// //         success: false,
// //         error: "Email not verified",
// //         debug: {
// //           email: user.email,
// //           isVerified: user.isVerified,
// //           requiresVerification: true
// //         }
// //       });
// //     }

// //     // Check password
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     console.log('🔍 PASSWORD MATCH:', isMatch);

// //     if (!isMatch) {
// //       return res.status(401).json({
// //         success: false,
// //         error: "Invalid password",
// //         debug: {
// //           email: user.email,
// //           passwordProvided: !!password,
// //           passwordMatch: false
// //         }
// //       });
// //     }

// //     // Generate tokens
// //     const tokens = generateTokens(user);

// //     res.json({
// //       success: true,
// //       message: "Login successful",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: user.isVerified
// //         },
// //         ...tokens
// //       },
// //       debug: {
// //         email: user.email,
// //         isVerified: user.isVerified,
// //         passwordMatch: true,
// //         tokensGenerated: true
// //       }
// //     });

// //   } catch (err) {
// //     console.error('❌ DEBUG LOGIN ERROR:', err);
// //     res.status(500).json({
// //       success: false,
// //       error: err.message,
// //       debug: { error: err.message }
// //     });
// //   }
// // };

// // // ====================== DEBUG Password ======================
// // // exports.debugPassword = async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;
    
// // //     console.log('🔍 DEBUG PASSWORD FOR:', email);
    
// // //     const user = await User.findOne({ where: { email } });
    
// // //     if (!user) {
// // //       return res.status(404).json({
// // //         success: false,
// // //         error: "User not found"
// // //       });
// // //     }

// // //     // Test password comparison
// // //     const isMatch = await bcrypt.compare(password, user.password);
    
// // //     // Also hash the provided password to see what it should be
// // //     const salt = await bcrypt.genSalt(10);
// // //     const hashedProvidedPassword = await bcrypt.hash(password, salt);
    
// // //     res.json({
// // //       success: true,
// // //       data: {
// // //         email: user.email,
// // //         isVerified: user.isVerified,
// // //         passwordMatch: isMatch,
// // //         storedPasswordHash: user.password,
// // //         providedPasswordHash: hashedProvidedPassword,
// // //         shouldMatch: user.password === hashedProvidedPassword
// // //       }
// // //     });
    
// // //   } catch (error) {
// // //     console.error('❌ DEBUG PASSWORD ERROR:', error);
// // //     res.status(500).json({
// // //       success: false,
// // //       error: error.message
// // //     });
// // //   }
// // // };



// // exports.tokenBlacklist = tokenBlacklist;





// // const db = require("../config/db");
// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");
// // const crypto = require("crypto");
// // const emailService = require("../services/emailService");

// // const User = db.User;
// // const EmailVerification = db.EmailVerification;

// // // In-memory stores (for demo, in production use Redis or DB)
// // let tokenBlacklist = [];
// // let refreshTokens = [];

// // // Generate tokens
// // const generateTokens = (user) => {
// //   const accessToken = jwt.sign(
// //     { id: user.id, email: user.email, role: user.role },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "15m" }
// //   );

// //   const refreshToken = jwt.sign(
// //     { id: user.id, email: user.email, role: user.role },
// //     process.env.JWT_REFRESH_SECRET,
// //     { expiresIn: "7d" }
// //   );

// //   refreshTokens.push(refreshToken);
// //   return { accessToken, refreshToken };
// // };

// // // Generate verification code
// // const generateVerificationCode = () => {
// //   return Math.floor(100000 + Math.random() * 900000).toString();
// // };

// // // Generate verification token
// // const generateVerificationToken = () => {
// //   return crypto.randomBytes(32).toString('hex');
// // };

// // // ====================== INITIATE REGISTRATION ======================
// // exports.initiateRegistration = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { name, email, password, role = "customer" } = req.body;

// //     // Validate input
// //     if (!name || !email || !password) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Name, email, and password are required"
// //       });
// //     }

// //     // Check if user already exists
// //     const existingUser = await User.findOne({
// //       where: { 
// //         [db.Sequelize.Op.or]: [{ email }, { name }] 
// //       },
// //       transaction
// //     });

// //     if (existingUser) {
// //       await transaction.rollback();
      
// //       if (existingUser.isVerified) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "User with this email or name already exists"
// //         });
// //       } else {
// //         return res.status(400).json({
// //           success: false,
// //           error: "An unverified account with this email already exists. Please verify your email or use a different email."
// //         });
// //       }
// //     }

// //     // Check for recent verification attempts
// //     const recentAttempt = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         expiresAt: { [db.Sequelize.Op.gt]: new Date() },
// //         isUsed: false
// //       },
// //       transaction
// //     });

// //     if (recentAttempt) {
// //       const timeLeft = Math.ceil((new Date(recentAttempt.expiresAt) - new Date()) / 1000 / 60);
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: `Verification code already sent. Please wait ${timeLeft} minutes before requesting a new code.`
// //       });
// //     }

// //     // Create unverified user - Model hooks will handle password hashing
// //     const user = await User.create({
// //       name,
// //       email,
// //       password: password, // Pass plain password - model hook will hash it
// //       role,
// //       isVerified: false
// //     }, { transaction });

// //     // Generate verification code and token
// //     const verificationCode = generateVerificationCode();
// //     const verificationToken = generateVerificationToken();
// //     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

// //     // Create verification record
// //     await EmailVerification.create({
// //       email,
// //       verificationCode,
// //       verificationToken,
// //       expiresAt,
// //       userId: user.id
// //     }, { transaction });

// //     // Send verification email
// //     const emailResult = await emailService.sendVerificationEmail(
// //       email, 
// //       verificationCode, 
// //       name
// //     );

// //     if (!emailResult.success) {
// //       await transaction.rollback();
// //       return res.status(500).json({
// //         success: false,
// //         error: "Failed to send verification email. Please try again."
// //       });
// //     }

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "Verification code sent to your email",
// //       data: {
// //         verificationToken,
// //         email: email,
// //         expiresIn: "15 minutes"
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error initiating registration:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== VERIFY EMAIL ======================
// // exports.verifyEmail = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { email, verificationCode, verificationToken } = req.body;

// //     if (!email || !verificationCode || !verificationToken) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email, verification code, and token are required"
// //       });
// //     }

// //     // Find verification record
// //     const verificationRecord = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         verificationToken,
// //         isUsed: false
// //       },
// //       include: [{
// //         model: User,
// //         as: 'user',
// //         attributes: ['id', 'name', 'email', 'isVerified']
// //       }],
// //       transaction
// //     });

// //     if (!verificationRecord) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Invalid verification request. Please request a new verification code."
// //       });
// //     }

// //     // Check if code is expired
// //     if (new Date() > verificationRecord.expiresAt) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Verification code has expired. Please request a new one."
// //       });
// //     }

// //     // Check attempt limits
// //     if (verificationRecord.attempts >= 5) {
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: "Too many verification attempts. Please request a new code."
// //       });
// //     }

// //     // Verify code
// //     if (verificationRecord.verificationCode !== verificationCode) {
// //       await verificationRecord.update({
// //         attempts: verificationRecord.attempts + 1
// //       }, { transaction });

// //       await transaction.commit();

// //       const attemptsLeft = 5 - (verificationRecord.attempts + 1);
// //       return res.status(400).json({
// //         success: false,
// //         error: `Invalid verification code. ${attemptsLeft} attempts remaining.`
// //       });
// //     }

// //     // Get user
// //     const user = await User.findByPk(verificationRecord.userId, { transaction });
// //     if (!user) {
// //       await transaction.rollback();
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found"
// //       });
// //     }

// //     if (user.isVerified) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is already verified"
// //       });
// //     }

// //     // Mark user as verified and update verification record
// //     await user.update({
// //       isVerified: true,
// //       verificationToken: null,
// //       verificationTokenExpires: null
// //     }, { transaction });

// //     await verificationRecord.update({
// //       isUsed: true,
// //       attempts: verificationRecord.attempts + 1
// //     }, { transaction });

// //     // Send welcome email
// //     await emailService.sendWelcomeEmail(user.email, user.name);

// //     // Generate tokens
// //     const tokens = generateTokens(user);

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "Email verified successfully! Your account is now active.",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: true
// //         },
// //         ...tokens
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error verifying email:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== RESEND VERIFICATION CODE ======================
// // exports.resendVerificationCode = async (req, res) => {
// //   const transaction = await db.sequelize.transaction();
  
// //   try {
// //     const { email } = req.body;

// //     if (!email) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is required"
// //       });
// //     }

// //     // Find user
// //     const user = await User.findOne({
// //       where: { email },
// //       transaction
// //     });

// //     if (!user) {
// //       await transaction.rollback();
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found with this email"
// //       });
// //     }

// //     if (user.isVerified) {
// //       await transaction.rollback();
// //       return res.status(400).json({
// //         success: false,
// //         error: "Email is already verified"
// //       });
// //     }

// //     // Check for recent attempts
// //     const recentAttempt = await EmailVerification.findOne({
// //       where: { 
// //         email,
// //         expiresAt: { [db.Sequelize.Op.gt]: new Date() },
// //         isUsed: false
// //       },
// //       transaction
// //     });

// //     if (recentAttempt) {
// //       const timeLeft = Math.ceil((new Date(recentAttempt.expiresAt) - new Date()) / 1000 / 60);
// //       await transaction.rollback();
// //       return res.status(429).json({
// //         success: false,
// //         error: `Please wait ${timeLeft} minutes before requesting a new verification code.`
// //       });
// //     }

// //     // Generate new verification code and token
// //     const verificationCode = generateVerificationCode();
// //     const verificationToken = generateVerificationToken();
// //     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

// //     // Create new verification record
// //     await EmailVerification.create({
// //       email,
// //       verificationCode,
// //       verificationToken,
// //       expiresAt,
// //       userId: user.id
// //     }, { transaction });

// //     // Send verification email
// //     const emailResult = await emailService.sendVerificationEmail(
// //       email, 
// //       verificationCode, 
// //       user.name
// //     );

// //     if (!emailResult.success) {
// //       await transaction.rollback();
// //       return res.status(500).json({
// //         success: false,
// //         error: "Failed to send verification email. Please try again."
// //       });
// //     }

// //     await transaction.commit();

// //     res.status(200).json({
// //       success: true,
// //       message: "New verification code sent to your email",
// //       data: {
// //         verificationToken,
// //         email: email,
// //         expiresIn: "15 minutes"
// //       }
// //     });

// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error("Error resending verification code:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== LOGIN (ENHANCED DEBUGGING) ======================
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     console.log('🔍 LOGIN ATTEMPT:', { email });

// //     const user = await User.findOne({ where: { email } });
    
// //     if (!user) {
// //       console.log('❌ USER NOT FOUND:', email);
// //       return res.status(401).json({
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     console.log('🔍 USER DETAILS:', {
// //       id: user.id,
// //       email: user.email,
// //       isVerified: user.isVerified,
// //       passwordLength: user.password ? user.password.length : 'no password',
// //       createdAt: user.createdAt
// //     });

// //     // Check if email is verified
// //     if (!user.isVerified) {
// //       console.log('❌ EMAIL NOT VERIFIED:', user.email);
// //       return res.status(403).json({
// //         success: false,
// //         error: "Please verify your email before logging in. Check your inbox for the verification code.",
// //         requiresVerification: true,
// //         email: user.email
// //       });
// //     }

// //     // Debug password comparison
// //     console.log('🔍 PASSWORD COMPARISON:', {
// //       providedPassword: password ? '***' : 'missing',
// //       storedPassword: user.password ? '***' : 'missing'
// //     });

// //     // Check if user has a password (for users created via other methods)
// //     if (!user.password) {
// //       console.log('❌ NO PASSWORD SET for user:', user.email);
// //       return res.status(401).json({ 
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     console.log('🔍 PASSWORD MATCH RESULT:', isMatch);

// //     if (!isMatch) {
// //       console.log('❌ PASSWORD MISMATCH for user:', user.email);
// //       return res.status(401).json({ 
// //         success: false,
// //         error: "Invalid email or password" 
// //       });
// //     }

// //     // Generate tokens
// //     const tokens = generateTokens(user);
// //     console.log('✅ LOGIN SUCCESSFUL:', { email: user.email, tokensGenerated: true });

// //     // Send proper response format
// //     res.status(200).json({
// //       success: true,
// //       message: "Login successful",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: user.isVerified
// //         },
// //         ...tokens
// //       }
// //     });

// //   } catch (err) {
// //     console.error('❌ LOGIN ERROR:', err);
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== GET PROFILE (UPDATED) ======================
// // exports.getProfile = async (req, res) => {
// //   try {
// //     const user = await User.findByPk(req.user.id, {
// //       attributes: { exclude: ["password"] },
// //     });
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       data: user
// //     });
// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== UPDATE USER (UPDATED) ======================
// // exports.updateUser = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { name, email, password, role } = req.body;

// //     const user = await User.findByPk(id);
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     // check if new name or email is already used by another user
// //     if (name || email) {
// //       const conflictUser = await User.findOne({
// //         where: {
// //           [db.Sequelize.Op.or]: [
// //             name ? { name } : {},
// //             email ? { email } : {},
// //           ],
// //           id: { [db.Sequelize.Op.ne]: id }, // exclude current user
// //         },
// //       });
// //       if (conflictUser) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "Another user with this name or email already exists",
// //         });
// //       }
// //     }

// //     // Update user - model hook will handle password hashing if password is changed
// //     await user.update({
// //       name: name ?? user.name,
// //       email: email ?? user.email,
// //       password: password ? password : user.password, // Pass plain password if updating
// //       role: role ?? user.role,
// //     });

// //     res.json({
// //       success: true,
// //       message: "User updated successfully",
// //       data: {
// //         id: user.id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         isVerified: user.isVerified
// //       },
// //     });

// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== DELETE USER (UPDATED) ======================
// // exports.deleteUser = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const user = await User.findByPk(id);
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: "User not found" 
// //       });
// //     }

// //     await user.destroy();
// //     res.json({ 
// //       success: true,
// //       message: "User deleted successfully" 
// //     });

// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false,
// //       error: err.message 
// //     });
// //   }
// // };

// // // ====================== REFRESH TOKEN ======================
// // exports.refreshToken = (req, res) => {
// //   const { token } = req.body;
// //   if (!token) {
// //     return res.status(401).json({ 
// //       success: false,
// //       error: "No token provided" 
// //     });
// //   }
  
// //   if (!refreshTokens.includes(token)) {
// //     return res.status(403).json({ 
// //       success: false,
// //       error: "Invalid refresh token" 
// //     });
// //   }

// //   jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
// //     if (err) {
// //       return res.status(403).json({ 
// //         success: false,
// //         error: "Invalid refresh token" 
// //       });
// //     }

// //     const tokens = generateTokens(user);
// //     res.json({
// //       success: true,
// //       data: tokens
// //     });
// //   });
// // };

// // // ====================== LOGOUT ======================
// // exports.logout = (req, res) => {
// //   const token = req.headers["authorization"]?.split(" ")[1];
// //   if (token) tokenBlacklist.push(token);

// //   const { refreshToken } = req.body;
// //   if (refreshToken) {
// //     refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
// //   }

// //   res.json({ 
// //     success: true,
// //     message: "Logout successful, tokens invalidated" 
// //   });
// // };

// // // ====================== DEBUG LOGIN ======================
// // exports.debugLogin = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
    
// //     console.log('🔍 DEBUG LOGIN ATTEMPT:', { email });
    
// //     const user = await User.findOne({ where: { email } });
// //     console.log('🔍 USER FOUND:', user ? {
// //       id: user.id,
// //       email: user.email,
// //       isVerified: user.isVerified,
// //       passwordExists: !!user.password
// //     } : 'USER NOT FOUND');

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found",
// //         debug: { email, userFound: false }
// //       });
// //     }

// //     // Check if email is verified
// //     if (!user.isVerified) {
// //       return res.status(403).json({
// //         success: false,
// //         error: "Email not verified",
// //         debug: {
// //           email: user.email,
// //           isVerified: user.isVerified,
// //           requiresVerification: true
// //         }
// //       });
// //     }

// //     // Check password
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     console.log('🔍 PASSWORD MATCH:', isMatch);

// //     if (!isMatch) {
// //       return res.status(401).json({
// //         success: false,
// //         error: "Invalid password",
// //         debug: {
// //           email: user.email,
// //           passwordProvided: !!password,
// //           passwordMatch: false
// //         }
// //       });
// //     }

// //     // Generate tokens
// //     const tokens = generateTokens(user);

// //     res.json({
// //       success: true,
// //       message: "Login successful",
// //       data: {
// //         user: {
// //           id: user.id,
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //           isVerified: user.isVerified
// //         },
// //         ...tokens
// //       },
// //       debug: {
// //         email: user.email,
// //         isVerified: user.isVerified,
// //         passwordMatch: true,
// //         tokensGenerated: true
// //       }
// //     });

// //   } catch (err) {
// //     console.error('❌ DEBUG LOGIN ERROR:', err);
// //     res.status(500).json({
// //       success: false,
// //       error: err.message,
// //       debug: { error: err.message }
// //     });
// //   }
// // };

// // // ====================== DEBUG PASSWORD ======================
// // exports.debugPassword = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
    
// //     console.log('🔍 DEBUG PASSWORD FOR:', email);
    
// //     const user = await User.findOne({ where: { email } });
    
// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         error: "User not found"
// //       });
// //     }

// //     // Test password comparison
// //     const isMatch = await bcrypt.compare(password, user.password);
    
// //     // Also hash the provided password to see what it should be
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedProvidedPassword = await bcrypt.hash(password, salt);
    
// //     res.json({
// //       success: true,
// //       data: {
// //         email: user.email,
// //         isVerified: user.isVerified,
// //         passwordMatch: isMatch,
// //         storedPasswordHash: user.password,
// //         providedPasswordHash: hashedProvidedPassword,
// //         shouldMatch: user.password === hashedProvidedPassword
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('❌ DEBUG PASSWORD ERROR:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // // ====================== FIX PASSWORD (TEMPORARY) ======================
// // exports.fixPassword = async (req, res) => {
// //   try {
// //     const { email, newPassword } = req.body;
    
// //     const user = await User.findOne({ where: { email } });
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false, 
// //         error: "User not found" 
// //       });
// //     }

// //     // This will trigger the model's beforeUpdate hook to hash the password properly
// //     await user.update({ password: newPassword });
    
// //     res.json({
// //       success: true,
// //       message: "Password fixed successfully"
// //     });
// //   } catch (error) {
// //     console.error('❌ FIX PASSWORD ERROR:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message
// //     });
// //   }
// // };

// // exports.tokenBlacklist = tokenBlacklist;


// const db = require("../config/db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const emailService = require("../services/emailService");
// const multer = require("multer");
// const path = require("path");

// const User = db.User;
// const UserProfile = db.UserProfile;
// const EmailVerification = db.EmailVerification;

// // Configure multer for profile pictures
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/profiles/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
// });

// const uploadProfilePicture = upload.single('profilePicture');

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

// // Generate verification code
// const generateVerificationCode = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Generate verification token
// const generateVerificationToken = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

// // ====================== INITIATE REGISTRATION ======================
// exports.initiateRegistration = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { name, email, password, role = "customer" } = req.body;

//     // Validate input
//     if (!name || !email || !password) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Name, email, and password are required"
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({
//       where: { 
//         [db.Sequelize.Op.or]: [{ email }, { name }] 
//       },
//       transaction
//     });

//     if (existingUser) {
//       await transaction.rollback();
      
//       if (existingUser.isVerified) {
//         return res.status(400).json({
//           success: false,
//           error: "User with this email or name already exists"
//         });
//       } else {
//         return res.status(400).json({
//           success: false,
//           error: "An unverified account with this email already exists. Please verify your email or use a different email."
//         });
//       }
//     }

//     // Check for recent verification attempts
//     const recentAttempt = await EmailVerification.findOne({
//       where: { 
//         email,
//         expiresAt: { [db.Sequelize.Op.gt]: new Date() },
//         isUsed: false
//       },
//       transaction
//     });

//     if (recentAttempt) {
//       const timeLeft = Math.ceil((new Date(recentAttempt.expiresAt) - new Date()) / 1000 / 60);
//       await transaction.rollback();
//       return res.status(429).json({
//         success: false,
//         error: `Verification code already sent. Please wait ${timeLeft} minutes before requesting a new code.`
//       });
//     }

//     // Create unverified user
//     const user = await User.create({
//       name,
//       email,
//       password: password,
//       role,
//       isVerified: false
//     }, { transaction });

//     // Create empty user profile
//     await UserProfile.create({
//       userId: user.id
//     }, { transaction });

//     // Generate verification code and token
//     const verificationCode = generateVerificationCode();
//     const verificationToken = generateVerificationToken();
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

//     // Create verification record
//     await EmailVerification.create({
//       email,
//       verificationCode,
//       verificationToken,
//       expiresAt,
//       userId: user.id
//     }, { transaction });

//     // Send verification email
//     const emailResult = await emailService.sendVerificationEmail(
//       email, 
//       verificationCode, 
//       name
//     );

//     if (!emailResult.success) {
//       await transaction.rollback();
//       return res.status(500).json({
//         success: false,
//         error: "Failed to send verification email. Please try again."
//       });
//     }

//     await transaction.commit();

//     res.status(200).json({
//       success: true,
//       message: "Verification code sent to your email",
//       data: {
//         verificationToken,
//         email: email,
//         expiresIn: "15 minutes"
//       }
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error initiating registration:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== UPDATE USER PROFILE ======================
// exports.updateProfile = async (req, res) => {
//   try {
//     uploadProfilePicture(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({
//           success: false,
//           error: err.message
//         });
//       }

//       const userId = req.user.id;
//       const {
//         phone,
//         age,
//         country,
//         city,
//         address,
//         postalCode,
//         dateOfBirth,
//         gender,
//         preferences
//       } = req.body;

//       try {
//         // Find user profile
//         let userProfile = await UserProfile.findOne({ where: { userId } });

//         const updateData = {};
//         if (phone !== undefined) updateData.phone = phone;
//         if (age !== undefined) updateData.age = age;
//         if (country !== undefined) updateData.country = country;
//         if (city !== undefined) updateData.city = city;
//         if (address !== undefined) updateData.address = address;
//         if (postalCode !== undefined) updateData.postalCode = postalCode;
//         if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
//         if (gender !== undefined) updateData.gender = gender;
//         if (preferences !== undefined) {
//           try {
//             updateData.preferences = typeof preferences === 'string' 
//               ? JSON.parse(preferences) 
//               : preferences;
//           } catch (parseError) {
//             return res.status(400).json({
//               success: false,
//               error: "Invalid preferences format"
//             });
//           }
//         }

//         // Handle profile picture upload
//         if (req.file) {
//           updateData.profilePicture = req.file.filename;
//         }

//         if (userProfile) {
//           // Update existing profile
//           await userProfile.update(updateData);
//         } else {
//           // Create new profile
//           updateData.userId = userId;
//           userProfile = await UserProfile.create(updateData);
//         }

//         // Get updated profile with user data
//         const updatedProfile = await UserProfile.findOne({
//           where: { userId },
//           include: [{
//             model: User,
//             as: 'user',
//             attributes: ['id', 'name', 'email', 'role', 'isVerified']
//           }]
//         });

//         res.json({
//           success: true,
//           message: "Profile updated successfully",
//           data: updatedProfile
//         });

//       } catch (error) {
//         console.error("Error updating profile:", error);
//         res.status(500).json({
//           success: false,
//           error: error.message
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Error in updateProfile:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== GET USER PROFILE ======================
// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const userWithProfile = await User.findByPk(userId, {
//       attributes: { exclude: ["password"] },
//       include: [{
//         model: UserProfile,
//         as: 'profile'
//       }]
//     });

//     if (!userWithProfile) {
//       return res.status(404).json({ 
//         success: false,
//         error: "User not found" 
//       });
//     }

//     // If no profile exists, create an empty one
//     if (!userWithProfile.profile) {
//       await UserProfile.create({ userId });
//       // Refetch user with profile
//       const updatedUser = await User.findByPk(userId, {
//         attributes: { exclude: ["password"] },
//         include: [{
//           model: UserProfile,
//           as: 'profile'
//         }]
//       });
//       return res.json({
//         success: true,
//         data: updatedUser
//       });
//     }

//     res.json({
//       success: true,
//       data: userWithProfile
//     });
//   } catch (err) {
//     console.error("Error getting profile:", err);
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

// // ====================== GET USER ORDERS ======================
// exports.getUserOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { page = 1, limit = 10, status } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = { userId };
//     if (status) whereClause.status = status;

//     const { count, rows: orders } = await db.Order.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: db.OrderItem,
//           as: 'items',
//           include: [{
//             model: db.Product,
//             as: 'product',
//             attributes: ['id', 'title', 'sku', 'mainImage']
//           }]
//         }
//       ],
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       distinct: true
//     });

//     res.status(200).json({
//       success: true,
//       data: orders,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count,
//         pages: Math.ceil(count / limit)
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== VERIFY EMAIL ======================
// exports.verifyEmail = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
  
//   try {
//     const { email, verificationCode, verificationToken } = req.body;

//     if (!email || !verificationCode || !verificationToken) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Email, verification code, and token are required"
//       });
//     }

//     // Find verification record
//     const verificationRecord = await EmailVerification.findOne({
//       where: { 
//         email,
//         verificationToken,
//         isUsed: false
//       },
//       include: [{
//         model: User,
//         as: 'user',
//         attributes: ['id', 'name', 'email', 'isVerified']
//       }],
//       transaction
//     });

//     if (!verificationRecord) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Invalid verification request. Please request a new verification code."
//       });
//     }

//     // Check if code is expired
//     if (new Date() > verificationRecord.expiresAt) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Verification code has expired. Please request a new one."
//       });
//     }

//     // Check attempt limits
//     if (verificationRecord.attempts >= 5) {
//       await transaction.rollback();
//       return res.status(429).json({
//         success: false,
//         error: "Too many verification attempts. Please request a new code."
//       });
//     }

//     // Verify code
//     if (verificationRecord.verificationCode !== verificationCode) {
//       await verificationRecord.update({
//         attempts: verificationRecord.attempts + 1
//       }, { transaction });

//       await transaction.commit();

//       const attemptsLeft = 5 - (verificationRecord.attempts + 1);
//       return res.status(400).json({
//         success: false,
//         error: `Invalid verification code. ${attemptsLeft} attempts remaining.`
//       });
//     }

//     // Get user
//     const user = await User.findByPk(verificationRecord.userId, { transaction });
//     if (!user) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "User not found"
//       });
//     }

//     if (user.isVerified) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Email is already verified"
//       });
//     }

//     // Mark user as verified and update verification record
//     await user.update({
//       isVerified: true,
//       verificationToken: null,
//       verificationTokenExpires: null
//     }, { transaction });

//     await verificationRecord.update({
//       isUsed: true,
//       attempts: verificationRecord.attempts + 1
//     }, { transaction });

//     // Send welcome email
//     await emailService.sendWelcomeEmail(user.email, user.name);

//     // Generate tokens
//     const tokens = generateTokens(user);

//     await transaction.commit();

//     res.status(200).json({
//       success: true,
//       message: "Email verified successfully! Your account is now active.",
//       data: {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           isVerified: true
//         },
//         ...tokens
//       }
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error verifying email:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // ====================== LOGIN ======================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log('🔍 LOGIN ATTEMPT:', { email });

//     const user = await User.findOne({ where: { email } });
    
//     if (!user) {
//       console.log('❌ USER NOT FOUND:', email);
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password" 
//       });
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       console.log('❌ EMAIL NOT VERIFIED:', user.email);
//       return res.status(403).json({
//         success: false,
//         error: "Please verify your email before logging in. Check your inbox for the verification code.",
//         requiresVerification: true,
//         email: user.email
//       });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log('🔍 PASSWORD MATCH RESULT:', isMatch);

//     if (!isMatch) {
//       console.log('❌ PASSWORD MISMATCH for user:', user.email);
//       return res.status(401).json({ 
//         success: false,
//         error: "Invalid email or password" 
//       });
//     }

//     // Generate tokens
//     const tokens = generateTokens(user);
//     console.log('✅ LOGIN SUCCESSFUL:', { email: user.email, tokensGenerated: true });

//     // Get user profile
//     const userWithProfile = await User.findByPk(user.id, {
//       attributes: { exclude: ["password"] },
//       include: [{
//         model: UserProfile,
//         as: 'profile'
//       }]
//     });

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         user: userWithProfile,
//         ...tokens
//       }
//     });

//   } catch (err) {
//     console.error('❌ LOGIN ERROR:', err);
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

// // ====================== UPDATE USER ======================
// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, password, role } = req.body;

//     // Users can only update their own profile unless they're admin
//     if (req.user.id != id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: "You can only update your own profile"
//       });
//     }

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         error: "User not found" 
//       });
//     }

//     // check if new name or email is already used by another user
//     if (name || email) {
//       const conflictUser = await User.findOne({
//         where: {
//           [db.Sequelize.Op.or]: [
//             name ? { name } : {},
//             email ? { email } : {},
//           ],
//           id: { [db.Sequelize.Op.ne]: id },
//         },
//       });
//       if (conflictUser) {
//         return res.status(400).json({
//           success: false,
//           error: "Another user with this name or email already exists",
//         });
//       }
//     }

//     // Update user
//     await user.update({
//       name: name ?? user.name,
//       email: email ?? user.email,
//       password: password ? password : user.password,
//       role: role ?? user.role,
//     });

//     res.json({
//       success: true,
//       message: "User updated successfully",
//       data: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isVerified: user.isVerified
//       },
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

// // ====================== DELETE USER ======================
// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Users can only delete their own account unless they're admin
//     if (req.user.id != id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: "You can only delete your own account"
//       });
//     }

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         error: "User not found" 
//       });
//     }

//     await user.destroy();
//     res.json({ 
//       success: true,
//       message: "User deleted successfully" 
//     });

//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };

// // ====================== REFRESH TOKEN ======================
// exports.refreshToken = (req, res) => {
//   const { token } = req.body;
//   if (!token) {
//     return res.status(401).json({ 
//       success: false,
//       error: "No token provided" 
//     });
//   }
  
//   if (!refreshTokens.includes(token)) {
//     return res.status(403).json({ 
//       success: false,
//       error: "Invalid refresh token" 
//     });
//   }

//   jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ 
//         success: false,
//         error: "Invalid refresh token" 
//       });
//     }

//     const tokens = generateTokens(user);
//     res.json({
//       success: true,
//       data: tokens
//     });
//   });
// };

// // ====================== LOGOUT ======================
// exports.logout = (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (token) tokenBlacklist.push(token);

//   const { refreshToken } = req.body;
//   if (refreshToken) {
//     refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
//   }

//   res.json({ 
//     success: true,
//     message: "Logout successful, tokens invalidated" 
//   });
// };

// exports.tokenBlacklist = tokenBlacklist;

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