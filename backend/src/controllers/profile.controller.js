import User from "../models/user.model.js";
import imagekit from "../lib/imagekit.js";
import fs from "fs";

export async function completeCandidateProfile(req, res) {
    try {
        const userId = req.user._id;
        const {
            bio,
            contactDetails,
            education,
            workExperience,
            projects,
            achievements,
            languagesKnown,
            disabilityStatus,
            militaryExperience,
            careerBreak,
            maritalStatus,
            preferredJobRoles,
            resume
        } = req.body;

        // Validation
        if (!bio || !bio.trim()) {
            return res.status(400).json({ message: "Bio is required." });
        }
        if (!contactDetails || !contactDetails.trim()) {
            return res.status(400).json({ message: "Contact details are required." });
        }
        if (!education || education.length === 0) {
            return res.status(400).json({ message: "At least one education entry is required." });
        }
        if (!preferredJobRoles || preferredJobRoles.length === 0) {
            return res.status(400).json({ message: "At least one preferred job role is required." });
        }
        if (preferredJobRoles.length > 3) {
            return res.status(400).json({ message: "Maximum 3 preferred job roles allowed." });
        }
        if (!resume || !resume.trim()) {
            return res.status(400).json({ message: "Resume is required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.bio = bio;
        user.contactDetails = contactDetails;
        user.education = education || [];
        user.workExperience = workExperience || [];
        user.projects = projects || [];
        user.achievements = achievements || "";
        user.languagesKnown = languagesKnown || [];
        user.disabilityStatus = disabilityStatus || "";
        user.militaryExperience = militaryExperience || "";
        user.careerBreak = careerBreak || "";
        user.maritalStatus = maritalStatus || "";
        user.preferredJobRoles = preferredJobRoles;
        user.resume = resume;
        user.profileCompleted = true;

        await user.save();

        res.status(200).json({
            message: "Candidate profile completed successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isHR: user.isHR,
                profileCompleted: user.profileCompleted,
                preferredJobRoles: user.preferredJobRoles
            }
        });
    } catch (error) {
        console.log("Error occurred while completing candidate profile, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function completeHRProfile(req, res) {
    try {
        const userId = req.user._id;
        const {
            bio,
            contactDetails,
            companyName,
            companyDetails,
            companyWebsite,
            hrRoles
        } = req.body;

        // Validation
        if (!bio || !bio.trim()) {
            return res.status(400).json({ message: "Bio is required." });
        }
        if (!contactDetails || !contactDetails.trim()) {
            return res.status(400).json({ message: "Contact details are required." });
        }
        if (!companyName || !companyName.trim()) {
            return res.status(400).json({ message: "Company name is required." });
        }
        if (!companyDetails || !companyDetails.trim()) {
            return res.status(400).json({ message: "Company details are required." });
        }
        if (!hrRoles || hrRoles.length === 0) {
            return res.status(400).json({ message: "At least one hiring role is required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.bio = bio;
        user.contactDetails = contactDetails;
        user.companyName = companyName;
        user.companyDetails = companyDetails;
        user.companyWebsite = companyWebsite || "";
        user.hrRoles = hrRoles;
        user.hrBio = bio;
        user.profileCompleted = true;

        await user.save();

        res.status(200).json({
            message: "HR profile completed successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isHR: user.isHR,
                profileCompleted: user.profileCompleted,
                companyName: user.companyName
            }
        });
    } catch (error) {
        console.log("Error occurred while completing HR profile, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProfileField(req, res) {
    try {
        const userId = req.user._id;
        const { field, value } = req.body;

        if (!field || value === undefined) {
            return res.status(400).json({ message: "Field and value are required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Allow only specific fields to be updated
        const allowedFields = [
            'bio', 'contactDetails', 'education', 'workExperience', 'projects',
            'achievements', 'languagesKnown', 'disabilityStatus', 'militaryExperience',
            'careerBreak', 'maritalStatus', 'preferredJobRoles', 'resume',
            'companyName', 'companyDetails', 'companyWebsite', 'hrRoles', 'hrBio',
            'fullProfile'
        ];

        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: "This field cannot be updated." });
        }

        // Handle full profile update
        if (field === 'fullProfile' && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                if (allowedFields.includes(key)) {
                    user[key] = value[key];
                }
            });
        } else {
            user[field] = value;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.log("Error occurred while updating profile, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getUserProfile(req, res) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        console.log("Error occurred while fetching user profile, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function uploadResume(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "User not found." });
        }

        try {
            // Read file into buffer
            const fileBuffer = fs.readFileSync(req.file.path);
            const fileName = `resume_${Date.now()}_${req.file.originalname}`;

            // Upload to ImageKit
            const result = await imagekit.upload({
                file: fileBuffer,            // Buffer from uploads folder
                fileName,
                folder: `hirehub/resumes/${userId}`,  // Similar to Cloudinary folder
            });

            // Save resume URL to DB
            user.resume = result.url;
            await user.save();

            res.status(200).json({
                message: "Resume uploaded successfully",
                resume: result.url,
            });

        } finally {
            // Delete temporary file uploaded by Multer
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error uploading resume:", error.message || error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Upload profile picture
export async function uploadProfilePicture(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "User not found." });
        }

        try {
            // Read file into buffer
            const fileBuffer = fs.readFileSync(req.file.path);
            const fileName = `profile_${Date.now()}_${req.file.originalname}`;

            // Upload to ImageKit
            const result = await imagekit.upload({
                file: fileBuffer,
                fileName,
                folder: `hirehub/profiles/${userId}`,
            });

            // Save profile picture URL to DB
            user.profilePic = result.url;
            await user.save();

            res.status(200).json({
                message: "Profile picture uploaded successfully",
                profilePic: result.url,
                user
            });

        } finally {
            // Delete temporary file uploaded by Multer
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error uploading profile picture:", error.message || error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}