const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const PASSWORD_RESET_WINDOW_MS = 30 * 60 * 1000;
const PASSWORD_RESET_SUCCESS_MESSAGE = "If an account exists for that email, password reset instructions have been sent.";

function buildTokenPayload(user) {
  return { id: user._id, role: user.role };
}

function buildUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildResetUrl(req, token) {
  const origin = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
  return `${origin.replace(/\/$/, "")}/reset-password/${token}`;
}

function getMailConfig() {
  const {
    SMTP_SERVICE,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  if (SMTP_SERVICE) {
    return {
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    };
  }

  if (!SMTP_HOST || !SMTP_PORT) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  };
}

function createMailTransporter() {
  const config = getMailConfig();
  if (!config) {
    return null;
  }

  return nodemailer.createTransport(config);
}

async function sendResetEmail(transporter, user, resetUrl) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Reset your Resume Genius password",
    text: `Hi ${user.name},\n\nUse the link below to reset your password. This link expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request a reset, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <p>Hi ${user.name},</p>
        <p>Use the button below to reset your Resume Genius password. This link expires in 30 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, paste this URL into your browser:</p>
        <p><a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a></p>
        <p>If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
  });
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });
    const token = jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ message: PASSWORD_RESET_SUCCESS_MESSAGE });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashResetToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_WINDOW_MS);
    await user.save();

    const resetUrl = buildResetUrl(req, rawToken);
    const transporter = createMailTransporter();

    if (transporter) {
      await transporter.verify();
      await sendResetEmail(transporter, user, resetUrl);
      return res.status(200).json({ message: PASSWORD_RESET_SUCCESS_MESSAGE });
    }

    if (process.env.NODE_ENV === "production") {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return res.status(503).json({ message: "Password recovery is currently unavailable." });
    }

    return res.status(200).json({
      message: PASSWORD_RESET_SUCCESS_MESSAGE,
      resetUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to process password reset." });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "New password is required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. You can sign in now." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password." });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
