import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /v1/api/users/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Bio, Skills, etc.)
// @route   PUT /v1/api/users/profile
export const updateUserProfile = async (req, res) => {
    console.log('updateUserProfile controller called');
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Update basic fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // 2. Safely initialize profile if it doesn't exist
        if (!user.profile) {
            user.profile = { skills: [], bio: "" };
        }

        // 3. Update profile fields only if they are provided in the body
        if (req.body.skills) {
            user.profile.skills = req.body.skills;
        }
        if (req.body.bio) {
            user.profile.bio = req.body.bio;
        }

        // Use markModified if you are updating nested objects in Mongoose
        user.markModified('profile');

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);

    } catch (error) {
        // If 'next' error persists, ensure this function is NOT being called as middleware
        res.status(500).json({ message: error.message });
    }
};