const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

// LOGIN USER - Simplified version
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // Clean email
        const cleanEmail = email.trim().toLowerCase();

        // Get user (no password field needed for plain text comparison)
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            console.log('❌ User not found:', cleanEmail);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ User found:', user.email);
        console.log('🔍 User isVerified:', user.isVerified);
        console.log('🔑 Password type:', typeof user.password);

        // Skip email verification check for now
        // if (!user.isVerified) {
        //     return res.status(401).json({ message: 'Please verify your email first.' });
        // }

        // Try plain text comparison first (for users with plain text passwords)
        let isMatch = false;

        if (user.password === password) {
            isMatch = true;
            console.log('✅ Plain text password match');
        } else {
            console.log('❌ Plain text password failed');
            // Try bcrypt comparison (for hashed passwords)
            try {
                const bcrypt = require('bcryptjs');
                isMatch = await bcrypt.compare(password, user.password);
                console.log('🔐 Bcrypt comparison result:', isMatch);
            } catch (bcryptError) {
                console.log('❌ Bcrypt comparison failed:', bcryptError.message);
            }
        }

        if (!isMatch) {
            console.log('❌ Password mismatch for:', cleanEmail);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Login successful for:', user.email);

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser };
