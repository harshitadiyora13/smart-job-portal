const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyProfile: {
        companyName: {
            type: String,
            default: ''
        },
        aboutUs: {
            type: String,
            default: ''
        },
        logo: {
            type: String,
            default: ''
        },
        banner: {
            type: String,
            default: ''
        },
        foundedYear: {
            type: String,
            default: ''
        },
        companySize: {
            type: String,
            default: ''
        },
        industry: {
            type: String,
            default: ''
        },
        headquarters: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        },
        facebook: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: ''
        },
        postalCode: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Create or update recruiter profile
recruiterSchema.statics.findOrCreate = async function(userId) {
    let recruiter = await this.findOne({ userId });
    if (!recruiter) {
        recruiter = new this({ _id: userId, userId });
        await recruiter.save();
    }
    return recruiter;
};

module.exports = mongoose.model('Recruiter', recruiterSchema);
