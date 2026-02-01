import JobPost from "../models/jobPost.model.js";
import User from "../models/user.model.js";

export async function createJobPost(req, res) {
    try {
        const { jobTitle, jobDescription, rolesAndResponsibilities, skillsRequired, jobType, natureOfEmployment, jobRole, salary, salaryMin, salaryMax, location } = req.body;
        const hrId = req.user._id;

        if (!jobTitle || !jobDescription || !rolesAndResponsibilities || !jobType || !natureOfEmployment || !jobRole) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        const newJobPost = new JobPost({
            hrId,
            jobTitle,
            jobDescription,
            rolesAndResponsibilities,
            skillsRequired: skillsRequired || [],
            jobType,
            natureOfEmployment,
            jobRole,
            salary: salary || "",
            salaryMin: salaryMin ? parseInt(salaryMin) : null,
            salaryMax: salaryMax ? parseInt(salaryMax) : null,
            location: location || ""
        });

        await newJobPost.save();

        res.status(201).json({
            message: "Job post created successfully",
            jobPost: newJobPost
        });
    } catch (error) {
        console.log("Error occurred while creating job post, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getJobPosts(req, res) {
    try {
        const { search = "", sortOrder = "desc" } = req.query;
        const hrId = req.user?._id;

        // Build query
        let query = {};
        if (hrId) {
            query.hrId = hrId;
        }

        // If search is provided, use fuzzy search
        if (search.trim()) {
            query.$or = [
                { jobTitle: { $regex: search, $options: "i" } },
                { jobDescription: { $regex: search, $options: "i" } },
                { jobRole: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        // Determine sort order
        const sortOptions = sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };

        const jobPosts = await JobPost.find(query)
            .populate("hrId", "fullName companyName")
            .sort(sortOptions);

        res.status(200).json({
            jobPosts
        });
    } catch (error) {
        console.log("Error occurred while fetching job posts, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFilteredJobPosts(req, res) {
    try {
        const candidateId = req.user._id;
        const { search = "", sortOrder = "desc" } = req.query;
        const candidate = await User.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found." });
        }

        // Import JobApplication to get applied jobs
        const JobApplication = (await import("../models/jobApplication.model.js")).default;

        // Get all job posts the candidate has already applied for
        const appliedJobPosts = await JobApplication.find({
            candidateId
        }).select("jobPostId");

        const appliedJobPostIds = appliedJobPosts.map(app => app.jobPostId.toString());

        // Build query to exclude applied jobs
        const query = {
            _id: { $nin: appliedJobPostIds }
        };

        // If preferred job roles are set, add them to the query with case-insensitive matching
        if (candidate.preferredJobRoles && candidate.preferredJobRoles.length > 0) {
            const preferredRolesRegex = candidate.preferredJobRoles.map(role => new RegExp(`^${role}$`, 'i'));
            query.jobRole = { $in: preferredRolesRegex };
        }

        // If search is provided, use fuzzy search
        if (search.trim()) {
            query.$or = [
                { jobTitle: { $regex: search, $options: "i" } },
                { jobDescription: { $regex: search, $options: "i" } },
                { jobRole: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        // Determine sort order
        const sortOptions = sortOrder === "asc" ? { createdAt: 1 } : { createdAt: -1 };

        const jobPosts = await JobPost.find(query)
            .populate("hrId", "fullName companyName")
            .sort(sortOptions);

        res.status(200).json({
            jobPosts
        });
    } catch (error) {
        console.log("Error occurred while fetching filtered job posts, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getJobPostById(req, res) {
    try {
        const { id } = req.params;
        const jobPost = await JobPost.findById(id).populate("hrId");

        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        res.status(200).json({
            jobPost
        });
    } catch (error) {
        console.log("Error occurred while fetching job post, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateJobPost(req, res) {
    try {
        const { id } = req.params;
        const { jobTitle, jobDescription, rolesAndResponsibilities, skillsRequired, jobType, natureOfEmployment, jobRole, salary, location } = req.body;
        const hrId = req.user._id;

        const jobPost = await JobPost.findById(id);

        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        if (jobPost.hrId.toString() !== hrId.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this job post." });
        }

        jobPost.jobTitle = jobTitle || jobPost.jobTitle;
        jobPost.jobDescription = jobDescription || jobPost.jobDescription;
        jobPost.rolesAndResponsibilities = rolesAndResponsibilities || jobPost.rolesAndResponsibilities;
        jobPost.skillsRequired = skillsRequired || jobPost.skillsRequired;
        jobPost.jobType = jobType || jobPost.jobType;
        jobPost.natureOfEmployment = natureOfEmployment || jobPost.natureOfEmployment;
        jobPost.jobRole = jobRole || jobPost.jobRole;
        jobPost.salary = salary !== undefined ? salary : jobPost.salary;
        jobPost.location = location !== undefined ? location : jobPost.location;

        await jobPost.save();

        res.status(200).json({
            message: "Job post updated successfully",
            jobPost
        });
    } catch (error) {
        console.log("Error occurred while updating job post, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteJobPost(req, res) {
    try {
        const { id } = req.params;
        const hrId = req.user._id;

        const jobPost = await JobPost.findById(id);

        if (!jobPost) {
            return res.status(404).json({ message: "Job post not found." });
        }

        if (jobPost.hrId.toString() !== hrId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this job post." });
        }

        await JobPost.findByIdAndDelete(id);

        res.status(200).json({
            message: "Job post deleted successfully"
        });
    } catch (error) {
        console.log("Error occurred while deleting job post, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
