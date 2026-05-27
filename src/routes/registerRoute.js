const express = require("express");

const {
  registerUser,
  verifyPayment,
} = require("../controllers/registerController");

const router = express.Router();

// REGISTER USER
router.post("/", registerUser);

// VERIFY PAYMENT
router.get("/verify", verifyPayment);

module.exports = router;
