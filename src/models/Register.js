const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    interest: String,
    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Register",
  registerSchema
);
