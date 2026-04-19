const CriticalAlert = require("../models/CriticalAlert");

const blockAdminWhenCriticalAlertPending = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 20) {
      return next();
    }

    const pendingAlert = await CriticalAlert.findOne({ status: "pending" })
      .select("_id reviewId averageRating customerName customerEmail customerPhone createdAt")
      .sort({ createdAt: -1 });

    if (!pendingAlert) {
      return next();
    }

    return res.status(423).json({
      success: false,
      message: "Admin functionality is temporarily locked until the pending critical review alert is responded to.",
      data: {
        activeAlertId: pendingAlert._id,
        reviewId: pendingAlert.reviewId,
        averageRating: pendingAlert.averageRating,
        customerName: pendingAlert.customerName,
        customerEmail: pendingAlert.customerEmail,
        customerPhone: pendingAlert.customerPhone,
        createdAt: pendingAlert.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { blockAdminWhenCriticalAlertPending };
