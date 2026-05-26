// controllers/registerController.js

const axios = require("axios");

const Register = require("../models/Register");

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      interest,
    } = req.body;

    // CHECK REQUIRED FIELDS
    if (
      !fullName ||
      !email ||
      !phone ||
      !location ||
      !interest
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // SAVE TO MONGODB
    const newRegistration = await Register.create({
      fullName,
      email,
      phone,
      location,
      interest,
    });

    // INITIALIZE PAYSTACK PAYMENT
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: 4000000, // ₦40,000 in kobo

        metadata: {
          registrationId: newRegistration._id,
          fullName,
          phone,
          interest,
        },

        callback_url:
          "http://localhost:3000/payment-success",
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Registration successful",

      authorization_url:
        response.data.data.authorization_url,
    });
  } catch (error) {
    console.log(error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
};
