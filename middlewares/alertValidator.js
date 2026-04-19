const { body, validationResult } = require("express-validator");

const respondToAlertValidationRules = [
  body("responseMessage")
    .trim()
    .notEmpty()
    .withMessage("Response message is required.")
    .isLength({ max: 1000 })
    .withMessage("Response message must not exceed 1000 characters."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

module.exports = { respondToAlertValidationRules, validate };
