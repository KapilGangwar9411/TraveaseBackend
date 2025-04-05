const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route to send OTP to phone number
router.post('/send-otp', authController.sendOTP);

// Route to verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Route to register user details
router.post('/register', authController.registerUser);

// Route to skip registration and create basic user
router.post('/skip-register', authController.skipRegister);

module.exports = router;
