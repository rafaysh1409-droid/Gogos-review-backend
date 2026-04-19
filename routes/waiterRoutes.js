const express = require("express");
const router = express.Router();

const {
  createWaiter,
  getWaiters,
  getWaiterNameIdList,
  getWaitersByName,
  getWaiterById,
  updateWaiterFullName,
  deleteWaiterById,
} = require("../controllers/waiterController");
const {
  createWaiterValidationRules,
  updateWaiterValidationRules,
  validate,
} = require("../middlewares/waiterValidator");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { blockAdminWhenCriticalAlertPending } = require("../middlewares/adminAlertMiddleware");

router.post("/", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), createWaiterValidationRules, validate, createWaiter);
router.get("/", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), getWaiters);
router.get("/name-id-list", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20, 40), getWaiterNameIdList);
router.get("/search/by-name", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20, 40), getWaitersByName);
router.get("/:id", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), getWaiterById);
router.put("/:id", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), updateWaiterValidationRules, validate, updateWaiterFullName);
router.delete("/:id", protect, blockAdminWhenCriticalAlertPending, restrictTo(10, 20), deleteWaiterById);

module.exports = router;
