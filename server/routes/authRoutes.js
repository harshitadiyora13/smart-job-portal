const express = require('express');
const { registerUser, loginUser, verifyEmail, resendVerification, forgotPassword, validateResetToken, resetPassword } = require('../controllers/authController.js');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router;