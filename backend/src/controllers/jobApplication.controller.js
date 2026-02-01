import JobApplication from "../models/jobApplication.model.js";
import JobPost from "../models/jobPost.model.js";
import User from "../models/user.model.js";
import { sendToLLM } from "../lib/llmClient.js";
import { sendAcceptanceEmail, sendRejectionEmail } from "../lib/email.js";
import { extractResumeTextFromURL } from "../lib/ocr.js";

export async function applyForJob(req, res) {
    try {
        const { jobPostId, expectedSalary, whyJoinRole, resume } = req.body;
        const candidateId = req.user._id;

        if (!jobPostId || !expectedSalary || !whyJoinRole || !resume) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if job post exists
        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        // Check if already applied
        const existingApplication = await JobApplication.findOne({
            jobPostId,
            candidateId
        });

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job." });
        }

        const newApplication = new JobApplication({
            jobPostId,
            candidateId,
            expectedSalary,
            whyJoinRole,
            resume
        });

        await newApplication.save();

        // Add application to job post
        jobPost.applicants.push(newApplication._id);
        await jobPost.save();

        res.status(201).json({
            message: "Application submitted successfully",
            application: newApplication
        });
    } catch (error) {
        console.log("Error occurred while applying for job, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getApplicationsByJobPost(req, res) {
    try {
        const { jobPostId } = req.params;
        const hrId = req.user._id;

        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        if (jobPost.hrId.toString() !== hrId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view these applications." });
        }

        const applications = await JobApplication.find({
            jobPostId
        }).populate("candidateId", "fullName email contactDetails resume");

        res.status(200).json({
            applications
        });
    } catch (error) {
        console.log("Error occurred while fetching applications, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getApplicationsByCandidate(req, res) {
    try {
        const { candidateId } = req.params;
        const userId = req.user._id;

        if (candidateId !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view these applications." });
        }

        const applications = await JobApplication.find({
            candidateId
        }).populate("jobPostId");

        res.status(200).json({
            applications
        });
    } catch (error) {
        console.log("Error occurred while fetching candidate applications, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getApplicationById(req, res) {
    try {
        const { id } = req.params;

        const application = await JobApplication.findById(id)
            .populate("jobPostId")
            .populate("candidateId", "fullName email contactDetails");

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        res.status(200).json({
            application
        });
    } catch (error) {
        console.log("Error occurred while fetching application, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateApplicationStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const hrId = req.user._id;

        if (!["Pending", "Rejected", "Accepted"].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        const application = await JobApplication.findById(id)
            .populate("candidateId", "fullName email")
            .populate("jobPostId");

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        const jobPost = await JobPost.findById(application.jobPostId._id).populate("hrId", "fullName companyName");
        if (jobPost.hrId._id.toString() !== hrId.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this application." });
        }

        const previousStatus = application.status;
        application.status = status;
        await application.save();

        // Send email based on status change
        if (status === "Accepted" && previousStatus !== "Accepted") {
            await sendAcceptanceEmail(
                application.candidateId.email,
                application.candidateId.fullName,
                {
                    jobTitle: jobPost.jobTitle,
                    companyName: jobPost.hrId.companyName,
                    jobRole: jobPost.jobRole,
                    salary: jobPost.salary,
                    salaryMin: jobPost.salaryMin,
                    salaryMax: jobPost.salaryMax
                }
            );
        } else if (status === "Rejected" && previousStatus !== "Rejected") {
            await sendRejectionEmail(
                application.candidateId.email,
                application.candidateId.fullName,
                {
                    jobTitle: jobPost.jobTitle,
                    companyName: jobPost.hrId.companyName,
                    jobRole: jobPost.jobRole
                },
                application.whyJoinRole
            );
        }

        res.status(200).json({
            message: "Application status updated successfully",
            application
        });
    } catch (error) {
        console.log("Error occurred while updating application status, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function analyzeProfileForJob(req, res) {
    try {
        const { jobPostId, expectedSalary, whyJoinRole, resume } = req.body;

        if (!jobPostId || !expectedSalary || !whyJoinRole || !resume) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Fetch job post details
        const jobPost = await JobPost.findById(jobPostId).populate("hrId", "fullName email");
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        // Create a detailed prompt for the LLM
        const prompt = `Analyze the following candidate profile for the job post details provided below. Provide a rating out of 10 and suggestions for improvement.\n\n` +
            `Job Details:\n` +
            `Title: ${jobPost.jobTitle}\n` +
            `Description: ${jobPost.jobDescription}\n` +
            `Skills Required: ${jobPost.skillsRequired.join(", ")}\n` +
            `Job Type: ${jobPost.jobType}\n` +
            `Nature of Employment: ${jobPost.natureOfEmployment}\n` +
            `Location: ${jobPost.location}\n` +
            `Salary Range: ${jobPost.salaryMin} - ${jobPost.salaryMax}\n\n` +
            `Candidate Details:\n` +
            `Resume: ${resume}\n` +
            `Statement: ${whyJoinRole}\n` +
            `Expected Salary: ${expectedSalary}`;

        // Call the LLM
        const analysis = await sendToLLM(prompt);
        if (analysis?.error)
            throw new Error(analysis.error);

        res.status(200).json({
            message: "Profile analyzed successfully",
            rating: analysis.rating,
            suggestions: analysis.suggestions,
        });
    } catch (error) {
        console.error("Error analyzing profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//helper
function cleanJsonString(str) {
    return str
        .trim()
        .replace(/^'+|'+$/g, "")           // remove leading/trailing single quotes
        .replace(/```json|```/g, "")       // remove ```json and ```
        .trim();
}

// Analyze single candidate with OCR (from job application form)
export async function analyzeCandidateWithOCR(req, res) {
    try {
        const { jobPostId, expectedSalary, whyJoinRole, resume } = req.body;
        const candidateId = req.user._id;

        if (!jobPostId || !expectedSalary || !whyJoinRole || !resume) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Get job post
        const jobPost = await JobPost.findById(jobPostId).populate("hrId");
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        // Extract resume text from URL
        let resumeText = "";
        if (resume) {
            try {
                resumeText = await extractResumeTextFromURL(resume);
            } catch (error) {
                console.error("Error extracting resume text:", error);
                return res.status(400).json({ message: "Failed to process resume. Please try again." });
            }
        }

        // Prepare LLM prompt with extracted resume text
        const prompt = `Analyze the following candidate profile for the job post. Provide a rating out of 10 and key insights.\n\n` +
            `Job Details:\n` +
            `Title: ${jobPost.jobTitle}\n` +
            `Description: ${jobPost.jobDescription}\n` +
            `Skills Required: ${jobPost.skillsRequired.join(", ")}\n` +
            `Location: ${jobPost.location}\n\n` +
            `Candidate Resume (extracted):\n${resumeText}\n\n` +
            `Candidate Expected Salary: ₹${expectedSalary}\n` +
            `Why Candidate Wants This Role:\n${whyJoinRole}\n\n` +
            `Provide response in JSON format with fields: rating (1-10), summary (brief), strengths (array), weaknesses (array), recommendation (hire/consider/pass)`;

        // Call LLM
        const analysis = await sendToLLM(prompt);

        if (analysis?.error)
            throw new Error(analysis.error);

        // Parse the JSON content if it is a string
        let result = analysis;
        if (typeof analysis.message.content === "string") {
            try {
                const cleaned = cleanJsonString(analysis.message.content);
                result = JSON.parse(cleaned);
            } catch (err) {
                console.error("JSON parse error:", err);
                throw new Error("Failed to parse analysis content");
            }
        }

        // Apply rating logic
        let finalRecommendation = result.recommendation ||
            result.rating >= 8 ? "Consider" : "Don't Consider";

        res.status(200).json({
            message: "Profile analyzed successfully",
            rating: result.rating || 0,
            summary: result.summary || "",
            strengths: result.strengths || [],
            weaknesses: result.weaknesses || [],
            recommendation: finalRecommendation
        });

    } catch (error) {
        console.error("Error analyzing candidate with OCR:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Analyze all candidates for a job post with OCR
export async function analyzeAllCandidatesWithOCR(req, res) {
    try {
        const { jobPostId } = req.body;
        const hrId = req.user._id;

        if (!jobPostId) {
            return res.status(400).json({ message: "Job Post ID is required." });
        }

        // Check authorization
        const jobPost = await JobPost.findById(jobPostId).populate("hrId");
        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }
        if (jobPost.hrId._id.toString() !== hrId.toString()) {
            return res.status(403).json({ message: "Not authorized to analyze applications for this job." });
        }

        // Get ONLY pending applications for this job post (exclude rejected and accepted)
        const applications = await JobApplication.find({
            jobPostId,
            status: "Pending"  // Only pending applications
        })
            .populate("candidateId", "fullName email")
            .sort({ createdAt: -1 });

        if (!applications || applications.length === 0) {
            return res.status(200).json({
                message: "No pending applications found",
                analyzedCandidates: []
            });
        }

        const analyzedCandidates = [];
        const failedAnalyses = [];

        // Analyze each candidate
        for (const application of applications) {
            try {
                let resumeText = "";
                if (application.resume) {
                    try {
                        resumeText = await extractResumeTextFromURL(application.resume);
                    } catch (error) {
                        console.error(`Error extracting resume for ${application.candidateId.fullName}:`, error);
                        resumeText = "Resume could not be processed";
                    }
                }

                // Prepare LLM prompt
                const prompt = `Analyze the following candidate profile for the job post. Provide a rating out of 10.\n\n` +
                    `Job: ${jobPost.jobTitle}\n` +
                    `Required Skills: ${jobPost.skillsRequired.join(", ")}\n` +
                    `Location: ${jobPost.location}\n\n` +
                    `Candidate Resume:\n${resumeText}\n\n` +
                    `Expected Salary: ₹${application.expectedSalary}\n` +
                    `Why They Want This Role:\n${application.whyJoinRole}\n\n` +
                    `Respond in JSON: {rating (1-10), summary (brief), recommendation (hire/consider/pass)}`;

                const analysis = await sendToLLM(prompt);

                if (analysis?.error)
                    throw new Error(analysis.error);

                let result = analysis;
                if (typeof analysis.message.content === "string") {
                    try {
                        const cleaned = cleanJsonString(analysis.message.content);
                        result = JSON.parse(cleaned);
                    } catch (err) {
                        console.error("JSON parse error:", err);
                        throw new Error("Failed to parse analysis content");
                    }
                }

                // Apply rating logic
                let finalRecommendation = result.recommendation ||
                    result.rating >= 8 ? "Consider" : "Don't Consider";

                analyzedCandidates.push({
                    applicationId: application._id,
                    candidateName: application.candidateId.fullName,
                    candidateEmail: application.candidateId.email,
                    expectedSalary: application.expectedSalary,
                    rating: result.rating || 0,
                    summary: result.summary || "",
                    recommendation: finalRecommendation,
                    whyJoinRole: application.whyJoinRole,
                    status: "analyzed"
                });
            } catch (error) {
                console.error(`Error analyzing candidate ${application.candidateId.fullName}:`, error);
                failedAnalyses.push({
                    candidateName: application.candidateId.fullName,
                    error: error.message
                });
            }
        }

        // If no candidates were successfully analyzed, return error
        if (analyzedCandidates.length === 0) {
            return res.status(400).json({
                message: "Couldn't able to analyze candidates. Please try again.",
                error: "All analysis attempts failed",
                failedCount: failedAnalyses.length
            });
        }

        // Sort by rating descending (best candidates first)
        analyzedCandidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        res.status(200).json({
            message: "Candidates analyzed successfully",
            jobPostTitle: jobPost.jobTitle,
            totalPendingApplications: applications.length,
            analyzedCount: analyzedCandidates.length,
            failedCount: failedAnalyses.length,
            analyzedCandidates,
            failedAnalyses: failedAnalyses.length > 0 ? failedAnalyses : null
        });
    } catch (error) {
        console.error("Error analyzing all candidates with OCR:", error);
        res.status(500).json({
            message: "Couldn't able to analyze candidates. Please try again.",
            error: error.message
        });
    }
}
