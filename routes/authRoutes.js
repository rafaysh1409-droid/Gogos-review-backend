const express = require("express");
const router = express.Router();

const { signup, login, refreshToken, changePassword } = require("../controllers/authController");
const {
  signupValidationRules,
  loginValidationRules,
  changePasswordValidationRules,
  validate,
} = require("../middlewares/authValidator");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/auth/signup
router.post("/signup", signupValidationRules, validate, signup);

// POST /api/auth/login
router.post("/login", loginValidationRules, validate, login);

// POST /api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// POST /api/auth/change-password  (protected — requires valid Bearer token)
router.post("/change-password", protect, changePasswordValidationRules, validate, changePassword);

module.exports = router;
