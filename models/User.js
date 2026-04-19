const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Role constants
const ROLES = {
  SUPER_ADMIN: 10,
  ADMIN: 20,
  CUSTOMER: 40,
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: Number,
      enum: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CUSTOMER],
      default: ROLES.CUSTOMER,
    },
  },
  { timestamps: true }
);

// Auto-combine fullName before save
userSchema.pre("save", async function () {
  // Always sync fullName from first + last
  this.fullName = `${this.firstName} ${this.lastName}`;

  // Hash password only when it is new or changed
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare plain-text password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = { User: mongoose.model("User", userSchema), ROLES };
