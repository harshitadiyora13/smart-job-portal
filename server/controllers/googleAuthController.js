const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================
// GOOGLE AUTH - VERIFY TOKEN & LOGIN/REGISTER
// ==========================
const googleAuth = async (req, res) => {
    try {
        const { idToken, userInfo, role = 'jobseeker' } = req.body;

        let email, name, picture, googleId;

        if (idToken) {
            // Verify Google ID token
            let ticket;
            try {
                ticket = await client.verifyIdToken({
                    idToken: idToken,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
            } catch (error) {
                console.error('Google token verification failed:', error);
                return res.status(401).json({ message: 'Invalid Google token' });
            }

            // Get user info from Google
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        } else if (userInfo) {
            // Use user info directly (from implicit flow)
            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
            googleId = userInfo.sub;
        } else {
            return res.status(400).json({ message: 'Google ID token or user info is required' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email not provided by Google' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Check if user exists by googleId first, then by email
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if user exists with same email but different auth provider
            const existingUser = await User.findOne({ email: cleanEmail });

            if (existingUser) {
                // Link Google account to existing user
                if (existingUser.authProvider === 'local') {
                    existingUser.googleId = googleId;
                    existingUser.authProvider = 'google';
                    if (picture && !existingUser.profilePicture) {
                        existingUser.profilePicture = picture;
                    }
                    await existingUser.save();
                    user = existingUser;
                } else {
                    return res.status(400).json({
                        message: 'Account already exists with different login method'
                    });
                }
            } else {
                // Create new user with Google auth
                user = await User.create({
                    name: name || 'Google User',
                    email: cleanEmail,
                    googleId: googleId,
                    authProvider: 'google',
                    profilePicture: picture || '',
                    role: role,
                    isVerified: true // Google users are pre-verified
                });
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user data (without password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider,
            isVerified: user.isVerified
        };

        res.json({
            message: 'Google authentication successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: error.message || 'Google authentication failed' });
    }
};

// ==========================
// GET GOOGLE CLIENT ID (for frontend)
// ==========================
const getGoogleClientId = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ message: 'Google Client ID not configured' });
    }
    res.json({ clientId });
};

module.exports = {
    googleAuth,
    getGoogleClientId
};
