
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter with proper configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    this.verifyTransporter();
  }

  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP transporter is ready to send emails');
    } catch (error) {
      console.error('❌ SMTP transporter verification failed:', error);
    }
  }

  async sendVerificationEmail(email, verificationCode, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getVerificationEmailTemplate(verificationCode, userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'E-Commerce'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Our E-Commerce Platform!',
        html: this.getWelcomeEmailTemplate(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}, Message ID: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  getVerificationEmailTemplate(code, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 5px;
            border-radius: 8px;
            margin: 20px 0;
            display: inline-block;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for registering with our e-commerce platform. To complete your registration, please use the following verification code:</p>
            
            <div style="text-align: center;">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
            </div>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The ${process.env.APP_NAME || 'E-Commerce'} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .feature-list { list-style: none; padding: 0; }
          .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .feature-list li:before { content: "✓ "; color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${process.env.APP_NAME || 'Our E-Commerce Platform'}!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your account has been successfully verified and is now active!</p>
            
            <p>You can now enjoy all the features of our platform:</p>
            <ul class="feature-list">
              <li>Browse our extensive product catalog</li>
              <li>Add items to your cart</li>
              <li>Complete purchases securely</li>
              <li>Track your orders in real-time</li>
              <li>Manage your profile and preferences</li>
              <li>Receive exclusive deals and offers</li>
            </ul>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Shopping Now
              </a>
            </p>
            
            <p>Happy shopping!<br>The ${process.env.APP_NAME || 'E-Commerce'} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      const testEmail = process.env.SMTP_USER;
      if (!testEmail) {
        console.log('❌ No test email configured');
        return { success: false, error: 'No test email configured' };
      }

      const result = await this.sendVerificationEmail(testEmail, '123456', 'Test User');
      if (result.success) {
        console.log('✅ Email configuration test passed');
        return { success: true };
      } else {
        console.log('❌ Email configuration test failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Email configuration test error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();