import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 8,
        },
        profilePic: {
            type: String,
            default: ""
        },
        isHR: {
            type: Boolean,
            default: false
        },
        profileCompleted: {
            type: Boolean,
            default: false
        },
        // Common fields for both HR and Candidate
        bio: {
            type: String,
            default: ""
        },
        contactDetails: {
            type: String,
            default: ""
        },
        // Candidate-specific fields
        education: [{
            degree: String,
            institution: String,
            year: String,
            cgpa: String
        }],
        workExperience: [{
            jobTitle: String,
            company: String,
            duration: String,
            description: String
        }],
        projects: [{
            title: String,
            description: String,
            link: String
        }],
        achievements: {
            type: String,
            default: ""
        },
        languagesKnown: [String],
        disabilityStatus: {
            type: String,
            default: ""
        },
        militaryExperience: {
            type: String,
            default: ""
        },
        careerBreak: {
            type: String,
            default: ""
        },
        maritalStatus: {
            type: String,
            default: ""
        },
        preferredJobRoles: [{
            type: String,
        }],
        resume: {
            type: String,
            default: ""
        },
        // HR-specific fields
        companyName: {
            type: String,
            default: ""
        },
        companyDetails: {
            type: String,
            default: ""
        },
        companyWebsite: {
            type: String,
            default: ""
        },
        hrRoles: [String],
        hrBio: {
            type: String,
            default: ""
        }
    }, { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;