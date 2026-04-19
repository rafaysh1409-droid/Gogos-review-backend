const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Basic Info (Required)
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 20,
    },

    // Overall Experience (Required, 1-5)
    overallExperience: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // What did you like most? (Required, multi-select)
    // Options: "Food quality", "Taste", "Service", "Ambience", "Cleanliness"
    likedMost: {
      type: [String],
      enum: ["Food quality", "Taste", "Service", "Ambience", "Cleanliness"],
      required: true,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "At least one option must be selected for 'What did you like most?'",
      },
    },

    // Detailed Ratings (Required, 1-5 each)
    ratings: {
      foodQuality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      service: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      ambiance: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      environment: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },

    waiterDetails: {
      type: [
        {
          servedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Waiter",
            required: true,
          },
          rateWaiter: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
        },
      ],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one waiter detail is required.",
      },
    },

    // What went wrong? (Conditional - required if any rating <= 3)
    // Options: "Slow Service", "Food issue", "Staff", "Cleanliness", "Other"
    whatWentWrong: {
      type: [String],
      enum: ["Slow Service", "Food issue", "Staff", "Cleanliness", "Other"],
    },

    // Chat box for "Other" in whatWentWrong
    whatWentWrongDetails: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // What did you love? (Conditional - optional if all ratings >= 4)
    // Options: "Burger", "Fries", "Drinks", "Service", "Vibe"
    whatDidYouLove: {
      type: [String],
      enum: ["Burger", "Fries", "Drinks", "Service", "Vibe"],
    },

    // Additional Comments (Optional)
    additionalComments: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
