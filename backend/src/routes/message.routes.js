import express from "express";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getAllUserMessages, sendMessageToUser } from "../controllers/message.controller.js";

const router = express.Router()

router.get("/users", isUserAuthenticated, getUsersForSidebar);
router.get("/:id", isUserAuthenticated, getAllUserMessages);

router.post("/send/:id", isUserAuthenticated, sendMessageToUser);

export default router;