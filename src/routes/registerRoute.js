// routes/registerRoute.js

const express = require("express");

const {
  registerUser,
} = require("../controllers/registerController");

const router = express.Router();

router.post("/", registerUser);

module.exports = router;
