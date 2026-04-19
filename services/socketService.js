let ioInstance = null;

const ADMIN_CRITICAL_ALERT_ROOM = "role:20:critical-alerts";
const getUserRoom = (userId) => `user:${userId}`;

const setSocketServer = (io) => {
  ioInstance = io;
};

const getSocketServer = () => ioInstance;

const emitCriticalReviewAlert = (payload) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.to(ADMIN_CRITICAL_ALERT_ROOM).emit("critical-review-alert", payload);
};

const emitCriticalReviewAlertResolved = (payload) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.to(ADMIN_CRITICAL_ALERT_ROOM).emit("critical-review-alert-resolved", payload);

  if (payload.customerUserId) {
    ioInstance.to(getUserRoom(String(payload.customerUserId))).emit("critical-review-response", payload);
  }
};

module.exports = {
  ADMIN_CRITICAL_ALERT_ROOM,
  getUserRoom,
  setSocketServer,
  getSocketServer,
  emitCriticalReviewAlert,
  emitCriticalReviewAlertResolved,
};
