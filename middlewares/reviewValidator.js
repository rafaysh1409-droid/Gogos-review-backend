const { body, validationResult } = require("express-validator");

const reviewValidationRules = [
  // ─── Basic Info ──────────────────────────────────────────────────────────
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isLength({ max: 150 })
    .withMessage("Email must not exceed 150 characters."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^[0-9\-\+\(\)\s]{10,20}$/)
    .withMessage("Phone must be between 10 and 20 characters and contain only digits, spaces, dashes, or parentheses."),

  // ─── Overall Experience (Required, 1-5) ────────────────────────────────
  body("overallExperience")
    .notEmpty()
    .withMessage("Overall experience rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Overall experience rating must be between 1 and 5."),

  // ─── What did you like most? (Required, array) ─────────────────────────
  body("likedMost")
    .isArray({ min: 1 })
    .withMessage("At least one option must be selected for 'What did you like most?'.")
    .custom((value) => {
      const validOptions = ["Food quality", "Taste", "Service", "Ambience", "Cleanliness"];
      return value.every((item) => validOptions.includes(item));
    })
    .withMessage("Invalid option(s) in 'What did you like most?'."),

  // ─── Detailed Ratings (Required, 1-5 each) ──────────────────────────────
  body("ratings.foodQuality")
    .notEmpty()
    .withMessage("Food quality rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Food quality rating must be between 1 and 5."),

  body("ratings.service")
    .notEmpty()
    .withMessage("Service rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Service rating must be between 1 and 5."),

  body("ratings.ambiance")
    .notEmpty()
    .withMessage("Ambiance rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Ambiance rating must be between 1 and 5."),

  body("ratings.environment")
    .notEmpty()
    .withMessage("Environment rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Environment rating must be between 1 and 5."),

  // ─── Waiter Details (Required) ──────────────────────────────────────────
  body("waiterDetails")
    .isArray({ min: 1 })
    .withMessage("At least one waiter detail is required."),

  body("waiterDetails.*.servedBy")
    .notEmpty()
    .withMessage("ServedBy (waiter id) is required for each waiter detail.")
    .isMongoId()
    .withMessage("ServedBy must be a valid waiter id."),

  body("waiterDetails.*.rateWaiter")
    .notEmpty()
    .withMessage("Rate Waiter is required for each waiter detail.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rate Waiter must be between 1 and 5."),

  // ─── Conditional: What went wrong? (Required if any rating <= 3) ─────────
  body("whatWentWrong")
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage("'What went wrong?' must be an array if provided.")
    .custom((value) => {
      if (!value || value.length === 0) return true;
      const validOptions = ["Slow Service", "Food issue", "Staff", "Cleanliness", "Other"];
      return value.every((item) => validOptions.includes(item));
    })
    .withMessage("Invalid option(s) in 'What went wrong?'."),

  // ─── Chat box for "Other" in whatWentWrong (Conditional) ────────────────
  body("whatWentWrongDetails")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Details for 'What went wrong?' must not exceed 500 characters."),

  // ─── What did you love? (Optional, array) ──────────────────────────────
  body("whatDidYouLove")
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage("'What did you love?' must be an array if provided.")
    .custom((value) => {
      if (!value || value.length === 0) return true;
      const validOptions = ["Burger", "Fries", "Drinks", "Service", "Vibe"];
      return value.every((item) => validOptions.includes(item));
    })
    .withMessage("Invalid option(s) in 'What did you love?'."),

  // ─── Additional Comments (Optional) ────────────────────────────────────
  body("additionalComments")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Additional comments must not exceed 500 characters."),
];

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

module.exports = { reviewValidationRules, validate };
