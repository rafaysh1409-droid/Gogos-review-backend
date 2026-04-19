const mongoose = require("mongoose");
const CriticalAlert = require("../models/CriticalAlert");
const { emitCriticalReviewAlertResolved } = require("../services/socketService");

const getPendingAlerts = async (req, res) => {
  try {
    const alerts = await CriticalAlert.find({ status: "pending" })
      .populate("reviewId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const respondToAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert id.",
      });
    }

    const alert = await CriticalAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    if (alert.status === "responded") {
      return res.status(409).json({
        success: false,
        message: "This alert has already been responded to.",
      });
    }

    alert.status = "responded";
    alert.responseMessage = responseMessage;
    alert.respondedBy = req.user.id;
    alert.respondedAt = new Date();
    await alert.save();

    const resolvedAlert = await CriticalAlert.findById(alert._id)
      .populate("reviewId")
      .populate("respondedBy", "_id fullName email role");

    emitCriticalReviewAlertResolved({
      id: resolvedAlert._id,
      reviewId: resolvedAlert.reviewId?._id || resolvedAlert.reviewId,
      status: resolvedAlert.status,
      averageRating: resolvedAlert.averageRating,
      customerUserId: resolvedAlert.customerUserId,
      customerName: resolvedAlert.customerName,
      customerEmail: resolvedAlert.customerEmail,
      customerPhone: resolvedAlert.customerPhone,
      responseMessage: resolvedAlert.responseMessage,
      respondedAt: resolvedAlert.respondedAt,
      respondedBy: resolvedAlert.respondedBy,
      createdAt: resolvedAlert.createdAt,
    });

    return res.status(200).json({
      success: true,
      message: "Critical alert responded successfully.",
      data: resolvedAlert,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { getPendingAlerts, respondToAlert };
