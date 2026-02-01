import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPost",
            required: true
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        expectedSalary: {
            type: Number,
            required: true
        },
        whyJoinRole: {
            type: String,
            required: true
        },
        resume: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Rejected", "Accepted"],
            default: "Pending"
        },
        applicationDate: {
            type: Date,
            default: Date.now
        }
    }, { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
