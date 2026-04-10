const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ["jobseeker", "recruiter", "admin"],
            default: "jobseeker",
        },

        // Profile fields for jobseekers
        phone: String,
        location: String,
        bio: String,
        skills: [String],
        experience: [{
            company: String,
            position: String,
            duration: String,
            description: String
        }],
        education: [{
            institution: String,
            degree: String,
            year: String
        }],
        resume: String,

        savedJobs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }],

        isVerified: {
            type: Boolean,
            default: false,
        },
        // OTP Verification fields
        verificationOTP: {
            code: String,
            expiresAt: Date,
            attempts: { type: Number, default: 0 },
            maxAttempts: { type: Number, default: 5 }
        },
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        // OTP for password reset
        resetPasswordOTP: {
            code: String,
            expiresAt: Date,
            attempts: { type: Number, default: 0 },
            maxAttempts: { type: Number, default: 5 }
        },
    },
    { timestamps: true }
);

// ✅ CORRECT pre-save hook
userSchema.pre("save", async function () {
    // `this` MUST be a normal function
    if (!this.isModified("password") || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
