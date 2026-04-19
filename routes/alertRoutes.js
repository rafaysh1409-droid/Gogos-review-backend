const express = require("express");
const router = express.Router();

const { getPendingAlerts, respondToAlert } = require("../controllers/alertController");
const { respondToAlertValidationRules, validate } = require("../middlewares/alertValidator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.get("/pending", protect, restrictTo(20), getPendingAlerts);
router.post("/:id/respond", protect, restrictTo(20), respondToAlertValidationRules, validate, respondToAlert);

module.exports = router;
