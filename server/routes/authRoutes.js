const express = require('express');
const { registerUser, loginUser, sendOTP, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController.js');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);

// OTP Verification Routes (Registration)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Password Reset Routes (OTP Based)
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;