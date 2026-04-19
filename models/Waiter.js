const mongoose = require("mongoose");

const waiterSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{11}$/, "Phone number must be exactly 11 digits."],
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leftOn: {
      type: Date,
      default: null,
    },
    totalRatingScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRatingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageWaiterRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Waiter", waiterSchema);
