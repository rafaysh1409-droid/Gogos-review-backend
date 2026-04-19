const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { blockAdminWhenCriticalAlertPending } = require("../middlewares/adminAlertMiddleware");

// GET /api/dashboard — Super Admin + Admin only (roles 10, 20)
router.get("/", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), getDashboardStats);

module.exports = router;
