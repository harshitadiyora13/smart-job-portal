const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

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

        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            role,
            verificationToken // Store token to check later
        });

        const verifyUrl = `http://localhost:5173/verify-email/${verificationToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Verify your email - JobFlow",
                html: `<h1>Welcome!</h1><p>Click <a href="${verifyUrl}">here</a> to verify your account.</p>`
            });
        } catch (err) {
            try {
                await User.findByIdAndDelete(user._id);
            } catch (_) {
                // ignore cleanup error
            }
            return res.status(500).json({ message: "Unable to send verification email. Please try again." });
        }

        res.status(201).json({ message: "Registration success! Please check your email to verify." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// LOGIN USER
// =======================
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // ✅ FIX 3: normalize email
        const cleanEmail = email.trim().toLowerCase();

        // Get user + password
        const user = await User.findOne({ email: cleanEmail }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Skip email verification check for now
        // if (!user.isVerified) {
        //     return res.status(401).json({ message: 'Please verify your email first.' });
        // }

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

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password before sending
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
// 2. VERIFY EMAIL
// ==========================
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid link' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified! You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// 3. FORGOT PASSWORD
// ==========================
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Valid for 10 mins.</p>`
        });
        res.json({ message: "Reset link sent to email" });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500).json({ message: "Email failed" });
    }
};

// ==========================
// 4. RESET PASSWORD - GET (Validate Token)
// ==========================
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        res.status(200).json({ message: "Token is valid" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// 4. RESET PASSWORD - POST (Reset Password)
// ==========================
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = password; // Pre-save hook will hash this
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// 5. RESEND VERIFICATION EMAIL
// ==========================
const resendVerification = async (req, res) => {
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

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        const verifyUrl = `http://localhost:5173/verify-email/${verificationToken}`;

        await sendEmail({
            email: user.email,
            subject: "Verify your email - JobFlow (New Link)",
            html: `<h1>New Verification Link</h1><p>Click <a href="${verifyUrl}">here</a> to verify your account.</p>`
        });

        res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================
// 6. LOGOUT
// ==========================
const logoutUser = (req, res) => {
    res.json({ message: "Logged out successfully" });
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    validateResetToken,
    resetPassword,
    logoutUser
};