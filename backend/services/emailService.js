const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Create transporter with proper configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
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
      console.log("✅ SMTP transporter is ready to send emails");
    } catch (error) {
      console.error("❌ SMTP transporter verification failed:", error);
    }
  }

  async sendVerificationEmail(email, verificationCode, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || "E-Commerce"}" <${
          process.env.SMTP_FROM || process.env.SMTP_USER
        }>`,
        to: email,
        subject: "Verify Your Email Address",
        html: this.getVerificationEmailTemplate(verificationCode, userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Verification email sent to ${email}, Message ID: ${result.messageId}`
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || "E-Commerce"}" <${
          process.env.SMTP_FROM || process.env.SMTP_USER
        }>`,
        to: email,
        subject: "Welcome to Our E-Commerce Platform!",
        html: this.getWelcomeEmailTemplate(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Welcome email sent to ${email}, Message ID: ${result.messageId}`
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
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
            
            <p>Best regards,<br>The ${
              process.env.APP_NAME || "E-Commerce"
            } Team</p>
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
            <h1>Welcome to ${
              process.env.APP_NAME || "Our E-Commerce Platform"
            }!</h1>
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
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/products" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Shopping Now
              </a>
            </p>
            
            <p>Happy shopping!<br>The ${
              process.env.APP_NAME || "E-Commerce"
            } Team</p>
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
        console.log("❌ No test email configured");
        return { success: false, error: "No test email configured" };
      }

      const result = await this.sendVerificationEmail(
        testEmail,
        "123456",
        "Test User"
      );
      if (result.success) {
        console.log("✅ Email configuration test passed");
        return { success: true };
      } else {
        console.log("❌ Email configuration test failed");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Email configuration test error:", error);
      return { success: false, error: error.message };
    }
  }

  // Add to existing EmailService class
  async sendProductInquiryEmail(inquiryData, adminEmail = null) {
    try {
      const toEmail =
        adminEmail || process.env.SMTP_USER || "comtanixahsan@gmail.com";

      const mailOptions = {
        from: `"${process.env.APP_NAME || "E-Commerce"}" <${
          process.env.SMTP_FROM || process.env.SMTP_USER
        }>`,
        to: toEmail,
        subject: `New Product Inquiry: ${inquiryData.inquiryType}`,
        html: this.getProductInquiryEmailTemplate(inquiryData),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Product inquiry email sent to ${toEmail}, Message ID: ${result.messageId}`
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending product inquiry email:", error);
      return { success: false, error: error.message };
    }
  }

  // Add this template method to your EmailService class
  getProductInquiryEmailTemplate(inquiryData) {
    const inquiryTypeLabels = {
      pricing: "Volume Pricing",
      shipping: "Shipping Options",
      specs: "Product Specifications",
      availability: "Product Availability",
      other: "Other",
    };

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
        .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #007bff; }
        .field-label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
        .field-value { color: #333; }
        .product-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Product Inquiry</h1>
        </div>
        <div class="content">
          <h2>Customer Inquiry Details</h2>
          
          <div class="field">
            <span class="field-label">Inquiry Type:</span>
            <span class="field-value">${
              inquiryTypeLabels[inquiryData.inquiryType] ||
              inquiryData.inquiryType
            }</span>
          </div>
          
          <div class="field">
            <span class="field-label">First Name:</span>
            <span class="field-value">${inquiryData.firstName}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${inquiryData.email}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Country:</span>
            <span class="field-value">${inquiryData.country}</span>
          </div>
          
          ${
            inquiryData.message
              ? `
          <div class="field">
            <span class="field-label">Message:</span>
            <span class="field-value">${inquiryData.message}</span>
          </div>
          `
              : ""
          }
          
          ${
            inquiryData.productName
              ? `
          <div class="product-info">
            <h3>Product Information</h3>
            <div class="field">
              <span class="field-label">Product Name:</span>
              <span class="field-value">${inquiryData.productName}</span>
            </div>
            ${
              inquiryData.productSku
                ? `
            <div class="field">
              <span class="field-label">SKU:</span>
              <span class="field-value">${inquiryData.productSku}</span>
            </div>
            `
                : ""
            }
            ${
              inquiryData.productId
                ? `
            <div class="field">
              <span class="field-label">Product ID:</span>
              <span class="field-value">${inquiryData.productId}</span>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }
          
          <div class="urgent">
            <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
          </div>
          
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
          <p>Best regards,<br>${process.env.APP_NAME || "E-Commerce"} System</p>
        </div>
        <div class="footer">
          <p>This email was generated automatically from the product inquiry form.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }

  // Add confirmation email method
  async sendInquiryConfirmationEmail(inquiryData) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || "E-Commerce"}" <${
          process.env.SMTP_FROM || process.env.SMTP_USER
        }>`,
        to: inquiryData.email,
        subject: "We've Received Your Product Inquiry",
        html: this.getInquiryConfirmationTemplate(inquiryData),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Inquiry confirmation email sent to ${inquiryData.email}, Message ID: ${result.messageId}`
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending inquiry confirmation email:", error);
      return { success: false, error: error.message };
    }
  }

  getInquiryConfirmationTemplate(inquiryData) {
    const inquiryTypeLabels = {
      pricing: "Volume Pricing",
      shipping: "Shipping Options",
      specs: "Product Specifications",
      availability: "Product Availability",
      other: "Other",
    };

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
        .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>We've Received Your Inquiry</h1>
        </div>
        <div class="content">
          <h2>Hello ${inquiryData.firstName},</h2>
          
          <p>Thank you for contacting us about our products. We've received your inquiry and our team will get back to you within 24 hours.</p>
          
          <div class="info-box">
            <h3>Your Inquiry Details:</h3>
            <p><strong>Inquiry Type:</strong> ${
              inquiryTypeLabels[inquiryData.inquiryType] ||
              inquiryData.inquiryType
            }</p>
            ${
              inquiryData.productName
                ? `<p><strong>Product:</strong> ${inquiryData.productName}</p>`
                : ""
            }
            ${
              inquiryData.message
                ? `<p><strong>Your Message:</strong> ${inquiryData.message}</p>`
                : ""
            }
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our product specialists will review your inquiry</li>
            <li>We'll contact you with detailed information</li>
            <li>You can expect a response within 24 hours</li>
          </ul>
          
          <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
          
          <p>Best regards,<br>The ${
            process.env.APP_NAME || "E-Commerce"
          } Team</p>
        </div>
        <div class="footer">
          <p>This email confirms that we've received your product inquiry.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }
}

// Export singleton instance
module.exports = new EmailService();
