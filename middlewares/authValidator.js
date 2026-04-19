const { body, validationResult } = require("express-validator");
const { ROLES } = require("../models/User");

// ─── Signup ────────────────────────────────────────────────────────────────
const signupValidationRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters."),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isLength({ max: 150 })
    .withMessage("Email must not exceed 150 characters."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),

  body("role")
    .optional()
    .isIn([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CUSTOMER])
    .withMessage(`Role must be one of: ${ROLES.SUPER_ADMIN} (Super Admin), ${ROLES.ADMIN} (Admin), ${ROLES.CUSTOMER} (Customer).`),
];

// ─── Login ─────────────────────────────────────────────────────────────────
const loginValidationRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];

// ─── Change Password ────────────────────────────────────────────────────────
const changePasswordValidationRules = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required."),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters.")
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error("New password must be different from old password.");
      }
      return true;
    }),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password.");
      }
      return true;
    }),
];

// ─── Shared error formatter ─────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  signupValidationRules,
  loginValidationRules,
  changePasswordValidationRules,
  validate,
};
