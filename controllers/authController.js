const jwt = require("jsonwebtoken");
const { User, ROLES } = require("../models/User");

// ─── Token helpers ───────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

// ─── Signup ──────────────────────────────────────────────────────────────────

// @desc   Register new user
// @route  POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role ?? ROLES.CUSTOMER,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        role:      user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

// @desc   Authenticate user and return tokens
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        role:      user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────

// @desc   Issue new access token using refresh token
// @route  POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully.",
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────

// @desc   Change authenticated user's password
// @route  POST /api/auth/change-password  (protected)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // req.user.id is set by authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook re-hashes the new password

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { signup, login, refreshToken, changePassword };
