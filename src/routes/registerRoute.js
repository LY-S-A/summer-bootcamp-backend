// // routes/registerRoute.js

// const express = require("express");

// const {
//   registerUser,
// } = require("../controllers/registerController");

// const router = express.Router();

// router.post("/", registerUser);

// module.exports = router;

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
