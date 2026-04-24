const express = require('express');
const { registerUser, loginUser, sendOTP, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword } = require('../controllers/authController.js');
const { googleAuth, getGoogleClientId } = require('../controllers/googleAuthController.js');

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

// Google OAuth Routes
router.post('/google', googleAuth);
router.get('/google-client-id', getGoogleClientId);

module.exports = router;