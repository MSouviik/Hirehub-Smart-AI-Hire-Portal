import express from "express";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import jobPostRoutes from "./routes/jobPost.routes.js";
import jobApplicationRoutes from "./routes/jobApplication.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import { app, server } from "./lib/socket.js";

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const PORT = process.env.PORT;

app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/job-posts", jobPostRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/profile", profileRoutes);

server.listen(PORT, async () => {
    await connectDB(); //awaitng for the db to connect
    console.log(`Server is running on port ${PORT}`);
});