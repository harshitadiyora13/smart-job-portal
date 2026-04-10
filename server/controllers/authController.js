const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

// =======================
// HELPER FUNCTIONS
// =======================

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure storage
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    const subject = "Your JobFlow Verification Code";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6;">JobFlow Email Verification</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="font-size: 36px; letter-spacing: 10px; color: #1f2937; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">JobFlow - Find Your Dream Job</p>
        </div>
    `;

    await sendEmail({ email, subject, html });
};

// Send OTP email for password reset
const sendPasswordResetOTPEmail = async (email, otp, name) => {
    const subject = "Password Reset Code - JobFlow";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ef4444;">Password Reset Request</h2>
            <p>Hi ${name || 'there'},</p>
            <p>You requested a password reset. Your verification code is:</p>
            <div style="background: #fef2f2; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #fecaca;">
                <h1 style="font-size: 36px; letter-spacing: 10px; color: #dc2626; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #dc2626; font-size: 14px;"><strong>If you didn't request this, please ignore this email and your password will remain unchanged.</strong></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">JobFlow - Find Your Dream Job</p>
        </div>
    `;

    await sendEmail({ email, subject, html });
};

// =======================
// SEND OTP (Registration/Login)
// =======================
const sendOTP = async (req, res) => {
    try {
        const { email, name, type = 'verification' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        let user = await User.findOne({ email: cleanEmail });

        // If sending OTP for registration, create user first if doesn't exist
        if (type === 'registration') {
            const { password, role } = req.body;

            if (!password) {
                return res.status(400).json({ message: 'Password is required for registration' });
            }

            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            user = await User.create({
                name: name || 'User',
                email: cleanEmail,
                password,
                role: role || 'jobseeker',
                isVerified: false
            });
        } else if (type === 'login') {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        // Check if previous OTP is still valid (cooldown: 60 seconds)
        if (user.verificationOTP?.expiresAt &&
            new Date(user.verificationOTP.expiresAt).getTime() - 9 * 60 * 1000 > Date.now()) {
            const timeLeft = Math.ceil((new Date(user.verificationOTP.expiresAt).getTime() - 9 * 60 * 1000 - Date.now()) / 1000);
            return res.status(429).json({
                message: `Please wait ${timeLeft} seconds before requesting a new OTP`,
                cooldown: timeLeft
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        // Store OTP (expires in 10 minutes)
        user.verificationOTP = {
            code: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            attempts: 0,
            maxAttempts: 5
        };

        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(user.email, otp, user.name);
        } catch (err) {
            console.error('Email sending failed:', err);
            return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }

        res.status(200).json({
            message: 'OTP sent successfully',
            email: cleanEmail,
            expiresIn: 600 // 10 minutes in seconds
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// =======================
// VERIFY OTP
// =======================
const verifyOTP = async (req, res) => {
    try {
        const { email, otp, type = 'verification' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP exists
        if (!user.verificationOTP?.code) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        // Check if OTP expired
        if (new Date() > new Date(user.verificationOTP.expiresAt)) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Check max attempts
        if (user.verificationOTP.attempts >= user.verificationOTP.maxAttempts) {
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Hash provided OTP and compare
        const hashedProvidedOTP = hashOTP(otp);

        if (hashedProvidedOTP !== user.verificationOTP.code) {
            user.verificationOTP.attempts += 1;
            await user.save();

            const remainingAttempts = user.verificationOTP.maxAttempts - user.verificationOTP.attempts;
            return res.status(400).json({
                message: 'Invalid OTP',
                remainingAttempts: Math.max(0, remainingAttempts)
            });
        }

        // OTP is correct - mark user as verified and clear OTP
        user.isVerified = true;
        user.verificationOTP = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Verification successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// =======================
// RESEND OTP
// =======================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Check cooldown (30 seconds minimum between resends)
        if (user.verificationOTP?.expiresAt &&
            new Date(user.verificationOTP.expiresAt).getTime() - 9 * 30 * 1000 > Date.now()) {
            const timeLeft = Math.ceil((new Date(user.verificationOTP.expiresAt).getTime() - 9 * 30 * 1000 - Date.now()) / 1000);
            return res.status(429).json({
                message: `Please wait ${timeLeft} seconds before resending`,
                cooldown: timeLeft
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.verificationOTP = {
            code: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0,
            maxAttempts: 5
        };

        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(user.email, otp, user.name);
        } catch (err) {
            console.error('Email sending failed:', err);
            return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }

        res.status(200).json({
            message: 'OTP resent successfully',
            expiresIn: 600
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// =======================
// REGISTER USER
// =======================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create unverified user
        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            role,
            isVerified: false
        });

        // Generate and send OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.verificationOTP = {
            code: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0,
            maxAttempts: 5
        };

        await user.save();

        try {
            await sendOTPEmail(user.email, otp, user.name);
        } catch (err) {
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: "Unable to send verification email. Please try again." });
        }

        res.status(201).json({
            message: "Registration successful! Please check your email for the OTP.",
            email: cleanEmail,
            requiresVerification: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password - try plain text first, then bcrypt
        let isMatch = false;

        if (user.password === password) {
            isMatch = true;
        } else {
            const isMatchBcrypt = await bcrypt.compare(password, user.password);
            isMatch = isMatchBcrypt;
        }
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // If not verified, require OTP
        if (!user.isVerified) {
            return res.status(401).json({
                message: 'Please verify your email first.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        user.password = undefined;

        res.json({
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// FORGOT PASSWORD (OTP Based)
// ==========================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check cooldown (60 seconds)
        if (user.resetPasswordOTP?.expiresAt &&
            new Date(user.resetPasswordOTP.expiresAt).getTime() - 9 * 60 * 1000 > Date.now()) {
            const timeLeft = Math.ceil((new Date(user.resetPasswordOTP.expiresAt).getTime() - 9 * 60 * 1000 - Date.now()) / 1000);
            return res.status(429).json({
                message: `Please wait ${timeLeft} seconds before requesting a new code`,
                cooldown: timeLeft
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.resetPasswordOTP = {
            code: hashedOTP,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            attempts: 0,
            maxAttempts: 5
        };

        // Clear old token-based fields if any
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        try {
            await sendPasswordResetOTPEmail(user.email, otp, user.name);
        } catch (err) {
            user.resetPasswordOTP = undefined;
            await user.save();
            return res.status(500).json({ message: "Failed to send reset code. Please try again." });
        }

        res.json({
            message: "Password reset code sent to your email",
            email: cleanEmail,
            expiresIn: 600
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// VERIFY RESET OTP
// ==========================
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and code are required" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP exists
        if (!user.resetPasswordOTP?.code) {
            return res.status(400).json({ message: "No reset code found. Please request a new one." });
        }

        // Check if OTP expired
        if (new Date() > new Date(user.resetPasswordOTP.expiresAt)) {
            return res.status(400).json({ message: "Code has expired. Please request a new one." });
        }

        // Check max attempts
        if (user.resetPasswordOTP.attempts >= user.resetPasswordOTP.maxAttempts) {
            return res.status(429).json({ message: "Too many failed attempts. Please request a new code." });
        }

        // Verify OTP
        const hashedProvidedOTP = hashOTP(otp);
        if (hashedProvidedOTP !== user.resetPasswordOTP.code) {
            user.resetPasswordOTP.attempts += 1;
            await user.save();

            const remainingAttempts = user.resetPasswordOTP.maxAttempts - user.resetPasswordOTP.attempts;
            return res.status(400).json({
                message: "Invalid code",
                remainingAttempts: Math.max(0, remainingAttempts)
            });
        }

        // OTP verified - mark as valid for password reset
        res.json({
            message: "Code verified. You can now reset your password.",
            verified: true,
            email: cleanEmail
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// RESET PASSWORD (After OTP Verification)
// ==========================
const resetPassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password || !otp) {
            return res.status(400).json({ message: "Email, code, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify OTP again for security
        if (!user.resetPasswordOTP?.code) {
            return res.status(400).json({ message: "Invalid or expired reset session" });
        }

        if (new Date() > new Date(user.resetPasswordOTP.expiresAt)) {
            return res.status(400).json({ message: "Code has expired" });
        }

        const hashedProvidedOTP = hashOTP(otp);
        if (hashedProvidedOTP !== user.resetPasswordOTP.code) {
            return res.status(400).json({ message: "Invalid code" });
        }

        // Update password and clear OTP
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// LOGOUT
// ==========================
const logoutUser = (req, res) => {
    res.json({ message: "Logged out successfully" });
};

module.exports = {
    registerUser,
    loginUser,
    sendOTP,
    verifyOTP,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    logoutUser
};