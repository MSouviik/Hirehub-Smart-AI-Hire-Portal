import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import {
    applyForJob,
    getApplicationsByJobPost,
    getApplicationsByCandidate,
    getApplicationById,
    updateApplicationStatus,
    analyzeProfileForJob,
    analyzeCandidateWithOCR,
    analyzeAllCandidatesWithOCR
} from "../controllers/jobApplication.controller.js";

const router = express.Router();

router.post("/apply", isUserAuthenticated, applyForJob);
router.get("/job-post/:jobPostId", isUserAuthenticated, getApplicationsByJobPost);
router.get("/candidate/:candidateId", isUserAuthenticated, getApplicationsByCandidate);
router.get("/:id", isUserAuthenticated, getApplicationById);
router.put("/:id", isUserAuthenticated, updateApplicationStatus);
router.post("/analyze", isUserAuthenticated, analyzeProfileForJob);
router.post("/analyze-with-ocr", isUserAuthenticated, analyzeCandidateWithOCR);
router.post("/analyze-all-with-ocr", isUserAuthenticated, analyzeAllCandidatesWithOCR);

export default router;
