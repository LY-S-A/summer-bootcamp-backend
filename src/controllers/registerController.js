// // controllers/registerController.js

// const axios = require("axios");

// const Register = require("../models/Register");

// const registerUser = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       location,
//       interest,
//     } = req.body;

//     // CHECK REQUIRED FIELDS
//     if (
//       !fullName ||
//       !email ||
//       !phone ||
//       !location ||
//       !interest
//     ) {
//       return res.status(400).json({
//         message: "All fields are required",
//       });
//     }

//     // SAVE TO MONGODB
//     const newRegistration = await Register.create({
//       fullName,
//       email,
//       phone,
//       location,
//       interest,
//     });

//     // INITIALIZE PAYSTACK PAYMENT
//     const response = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: 4000000, // ₦40,000 in kobo

//         metadata: {
//           registrationId: newRegistration._id,
//           fullName,
//           phone,
//           interest,
//         },

//         callback_url:
//           "http://localhost:3000/payment-success",
//       },

//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Registration successful",

//       authorization_url:
//         response.data.data.authorization_url,
//     });
//   } catch (error) {
//     console.log(error.response?.data || error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

// module.exports = {
//   registerUser,
// };

const axios = require("axios");
const Register = require("../models/Register");

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      interest,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !location ||
      !interest
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // CREATE USER (PENDING PAYMENT)
    const newRegistration = await Register.create({
      fullName,
      email,
      phone,
      location,
      interest,
      paymentStatus: "pending",
    });

    // INITIATE PAYSTACK PAYMENT
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

// ================= VERIFY PAYMENT =================
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Missing reference",
      });
    }

    // VERIFY WITH PAYSTACK
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = response.data.data;

    if (payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
    }

    const registrationId =
      payment.metadata.registrationId;

    // UPDATE USER PAYMENT STATUS
    const updatedUser = await Register.findByIdAndUpdate(
      registrationId,
      {
        paymentStatus: "paid",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

module.exports = {
  registerUser,
  verifyPayment,
};
