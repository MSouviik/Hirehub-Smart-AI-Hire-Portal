import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL || "your-email@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "your-app-password"
    }
});

// Function to send acceptance email
export async function sendAcceptanceEmail(candidateEmail, candidateName, jobData) {
    try {
        const templatePath = path.join(__dirname, "../templates/acceptance.ejs");

        let salaryDisplay = "";
        if (jobData.salary) {
            salaryDisplay = jobData.salary;
        } else if (jobData.salaryMin && jobData.salaryMax) {
            salaryDisplay = `₹${jobData.salaryMin.toLocaleString()} - ₹${jobData.salaryMax.toLocaleString()}`;
        }

        const html = await renderFile(templatePath, {
            candidateName,
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            jobRole: jobData.jobRole,
            salary: salaryDisplay
        });

        const mailOptions = {
            from: process.env.GMAIL_EMAIL || "noreply@hirehub.com",
            to: candidateEmail,
            subject: `Great News! You're Selected for ${jobData.jobTitle} at ${jobData.companyName}`,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Acceptance email sent to ${candidateEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending acceptance email:", error);
        return false;
    }
}

// Function to send rejection email
export async function sendRejectionEmail(candidateEmail, candidateName, jobData, candidateMotivation) {
    try {
        const templatePath = path.join(__dirname, "../templates/rejection.ejs");

        const html = await renderFile(templatePath, {
            candidateName,
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            jobRole: jobData.jobRole,
            candidateMotivation: candidateMotivation || "Thank you for your interest in this position."
        });

        const mailOptions = {
            from: process.env.GMAIL_EMAIL || "noreply@hirehub.com",
            to: candidateEmail,
            subject: `Application Update: ${jobData.jobTitle} at ${jobData.companyName}`,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Rejection email sent to ${candidateEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending rejection email:", error);
        return false;
    }
}

// Function to send OTP verification email
export async function sendOTPEmail(userEmail, fullName, otp) {
    try {
        const templatePath = path.join(__dirname, "../templates/otp-verification.ejs");

        const html = await renderFile(templatePath, {
            fullName: fullName || "User",
            otp: otp
        });

        const mailOptions = {
            from: process.env.GMAIL_EMAIL || "noreply@hirehub.com",
            to: userEmail,
            subject: "HireHub - Email Verification OTP",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
}
