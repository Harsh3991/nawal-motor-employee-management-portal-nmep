const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `${process.env.FROM_NAME || 'NMEP'} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nawal Motor Employee Portal</h1>
        </div>
        <div class="content">
          <p>Hello ${name || 'User'},</p>
          <p>Your One-Time Password (OTP) for login is:</p>
          <div class="otp">${otp}</div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nawal Motor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    email,
    subject: 'Your Login OTP - NMEP',
    html,
  });
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name, employeeId, tempPassword) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .credentials { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Nawal Motor</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Welcome to Nawal Motor Employee Management Portal! Your account has been created successfully.</p>
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Portal</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nawal Motor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    email,
    subject: 'Welcome to Nawal Motor - Your Account Details',
    html,
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nawal Motor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return this.sendEmail({
    email,
    subject: 'Password Reset Request - NMEP',
    html,
  });
};
