import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import upload, { uploadImage } from "../middleware/upload.middleware.js";
import {
    completeCandidateProfile,
    completeHRProfile,
    updateProfileField,
    getUserProfile,
    uploadResume,
    uploadProfilePicture
} from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/complete-candidate", isUserAuthenticated, completeCandidateProfile);
router.post("/complete-hr", isUserAuthenticated, completeHRProfile);
router.put("/update-field", isUserAuthenticated, updateProfileField);
router.post("/upload-resume", isUserAuthenticated, upload.single("resume"), uploadResume);
router.post("/upload-picture", isUserAuthenticated, uploadImage.single("profilePic"), uploadProfilePicture);
router.get("/", isUserAuthenticated, getUserProfile);

export default router;
