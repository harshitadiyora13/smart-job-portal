const Recruiter = require('../models/Recruiter');
const User = require('../models/User');

// Create or update company profile
const createCompanyProfile = async (req, res) => {
    try {
        const {
            companyName,
            aboutUs,
            logo,
            banner,
            foundedYear,
            companySize,
            industry,
            headquarters,
            website,
            linkedin,
            twitter,
            facebook,
            email,
            phone,
            address,
            city,
            country,
            postalCode
        } = req.body;

        const recruiterId = req.user.id;

        // Check if company profile already exists
        let recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            // Create recruiter if doesn't exist
            recruiter = new Recruiter({
                _id: recruiterId,
                userId: req.user.id,
                companyProfile: {
                    companyName,
                    aboutUs,
                    logo,
                    banner,
                    foundedYear,
                    companySize,
                    industry,
                    headquarters,
                    website,
                    linkedin,
                    twitter,
                    facebook,
                    email,
                    phone,
                    address,
                    city,
                    country,
                    postalCode
                }
            });
        } else {
            // Update existing company profile
            recruiter.companyProfile = {
                companyName,
                aboutUs,
                logo,
                banner,
                foundedYear,
                companySize,
                industry,
                headquarters,
                website,
                linkedin,
                twitter,
                facebook,
                email,
                phone,
                address,
                city,
                country,
                postalCode
            };
        }

        await recruiter.save();

        // Also update user record with company info
        const user = await User.findById(recruiterId);
        if (user) {
            user.company = companyName;
            await user.save();
        }

        res.status(201).json({
            message: 'Company profile created successfully',
            data: recruiter.companyProfile
        });
    } catch (error) {
        console.error('Create company profile error:', error);
        res.status(500).json({
            message: 'Failed to create company profile',
            error: error.message
        });
    }
};

// Get company profile
const getCompanyProfile = async (req, res) => {
    try {
        let recruiterId;

        // If recruiterId is in params, use it (public access)
        if (req.params.recruiterId) {
            recruiterId = req.params.recruiterId;
        } else {
            // Otherwise use authenticated user's ID (private access)
            recruiterId = req.user.id;
        }

        const recruiter = await Recruiter.findById(recruiterId);

        if (!recruiter || !recruiter.companyProfile) {
            return res.status(404).json({
                message: 'Company profile not found'
            });
        }

        // Convert relative URLs to full URLs for existing profiles
        const companyProfile = recruiter.companyProfile;
        if (companyProfile.logo && !companyProfile.logo.startsWith('http')) {
            companyProfile.logo = `http://localhost:5000${companyProfile.logo}`;
        }
        if (companyProfile.banner && !companyProfile.banner.startsWith('http')) {
            companyProfile.banner = `http://localhost:5000${companyProfile.banner}`;
        }

        res.status(200).json(companyProfile);
    } catch (error) {
        console.error('Get company profile error:', error);
        res.status(500).json({
            message: 'Failed to get company profile',
            error: error.message
        });
    }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
    try {
        const {
            companyName,
            aboutUs,
            logo,
            banner,
            foundedYear,
            companySize,
            industry,
            headquarters,
            website,
            linkedin,
            twitter,
            facebook,
            email,
            phone,
            address,
            city,
            country,
            postalCode
        } = req.body;

        const recruiterId = req.user.id;
        const recruiter = await Recruiter.findById(recruiterId);

        if (!recruiter) {
            return res.status(404).json({
                message: 'Recruiter not found'
            });
        }

        // Update company profile
        recruiter.companyProfile = {
            companyName,
            aboutUs,
            logo,
            banner,
            foundedYear,
            companySize,
            industry,
            headquarters,
            website,
            linkedin,
            twitter,
            facebook,
            email,
            phone,
            address,
            city,
            country,
            postalCode
        };

        await recruiter.save();

        // Also update user record with company name
        const user = await User.findById(recruiterId);
        if (user) {
            user.company = companyName;
            await user.save();
        }

        res.status(200).json({
            message: 'Company profile updated successfully',
            data: recruiter.companyProfile
        });
    } catch (error) {
        console.error('Update company profile error:', error);
        res.status(500).json({
            message: 'Failed to update company profile',
            error: error.message
        });
    }
};

module.exports = {
    createCompanyProfile,
    getCompanyProfile,
    updateCompanyProfile
};
