import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import {
    createJobPost,
    getJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    getFilteredJobPosts
} from "../controllers/jobPost.controller.js";

const router = express.Router();

router.post("/", isUserAuthenticated, createJobPost);
router.get("/", isUserAuthenticated, getJobPosts);
router.get("/filtered", isUserAuthenticated, getFilteredJobPosts);
router.get("/:id", getJobPostById);
router.put("/:id", isUserAuthenticated, updateJobPost);
router.delete("/:id", isUserAuthenticated, deleteJobPost);

export default router;
