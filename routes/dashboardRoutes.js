const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// GET /api/dashboard — Super Admin + Admin only (roles 10, 20)
router.get("/", protect, restrictTo(10, 20), getDashboardStats);

module.exports = router;
