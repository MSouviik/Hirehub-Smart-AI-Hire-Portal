import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
    {
        hrId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        jobTitle: {
            type: String,
            required: true
        },
        jobDescription: {
            type: String,
            required: true
        },
        rolesAndResponsibilities: {
            type: String,
            required: true
        },
        skillsRequired: [String],
        jobType: {
            type: String,
            enum: ["Permanent", "Contractual"],
            required: true
        },
        natureOfEmployment: {
            type: String,
            enum: ["Full-time", "Part-time"],
            required: true
        },
        jobRole: {
            type: String,
            required: true
        },
        salary: {
            type: String,
            default: ""
        },
        salaryMin: {
            type: Number,
            default: null
        },
        salaryMax: {
            type: Number,
            default: null
        },
        location: {
            type: String,
            default: ""
        },
        applicants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobApplication"
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }, { timestamps: true }
);

const JobPost = mongoose.model("JobPost", jobPostSchema);

export default JobPost;
