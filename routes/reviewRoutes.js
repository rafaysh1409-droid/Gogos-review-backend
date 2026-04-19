const express = require("express");
const router = express.Router();

const { submitReview, getReviews, getReviewById, deleteReview } = require("../controllers/reviewController");
const { reviewValidationRules, validate } = require("../middlewares/reviewValidator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { blockAdminWhenCriticalAlertPending } = require("../middlewares/adminAlertMiddleware");

// POST /api/reviews  — Customer only (role 40)
router.post("/", protect, restrictTo(40), reviewValidationRules, validate, submitReview);

// GET  /api/reviews  — Super Admin + Admin only (roles 10, 20)
router.get("/", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), getReviews);

// GET  /api/reviews/:id  — Super Admin + Admin only (roles 10, 20)
router.get("/:id", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), getReviewById);

// DELETE /api/reviews/:id  — Super Admin only (role 10)
router.delete("/:id", protect, restrictTo(10), deleteReview);

module.exports = router;
