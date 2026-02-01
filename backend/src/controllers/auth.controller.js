import { generateToken } from "../lib/Utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import imagekit from "../lib/imagekit.js";
import { sendOTPEmail } from "../lib/email.js";

// Store OTP in memory (for production, use Redis)
const otpStore = new Map();

export async function signup(req, res) {
    const { fullName, email, password, isHR } = req.body || {};
    try {
        if (!email || !password || !fullName)
            return res.status(400).json({ message: "All fields are mandatory." });


        if (password.length < 8)
            return res.status(400).json({ message: "Password must contain at least 8 characters." });

        const user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists. Please login!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            isHR: isHR || false
        });

        if (newUser) {
            //incase of success -- generating jwt token
            generateToken(newUser._id, res);
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                isHR: newUser.isHR,
                profileCompleted: newUser.profileCompleted
            })
        } else {
            res.status(400).json({ message: "Invalid user data!" });
        }
    } catch (error) {
        console.log("Error occurred while signup, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function login(req, res) {
    const { email, password, isHR } = req.body || {};
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ message: "Invalid login credentials." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid login credentials." });

        // Check if the user is an HR if the isHR flag is provided
        if (isHR && !user.isHR)
            return res.status(403).json({ message: "Access denied. Not an HR account." });

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            isHR: user.isHR,
            profileCompleted: user.profileCompleted
        });
    } catch (error) {
        console.log("Error occurred while login, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function signout(req, res) {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log("Error occured while logout, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProfileAvatar(req, res) {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required." });
        }

        // ImageKit upload (base64 OR URL OR file buffer)
        const uploadResponse = await imagekit.upload({
            file: profilePic,                      // base64 string
            fileName: `avatar_${Date.now()}.jpg`,  // give it a name
            folder: `hirehub/profile/${userId}`,    // optional folder structure
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.url },    // use ImageKit URL
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(
            "Error occurred while updating profile avatar, Error:",
            error.message || error
        );
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function checkAuthentication(req, res) {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error occured while checking user authentication, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Generate and send OTP
export async function requestOTP(req, res) {
    try {
        const { email, fullName, password, isHR } = req.body;

        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "Email, full name, and password are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please login!" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiration (100 seconds)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 100 * 1000,
            fullName,
            password,
            isHR: isHR || false,
            attempts: 0
        });

        // Send OTP email
        await sendOTPEmail(email, fullName, otp);

        res.status(200).json({
            message: "OTP sent to email. Valid for 100 seconds.",
            email
        });
    } catch (error) {
        console.log("Error occurred while requesting OTP, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Verify OTP and complete signup
export async function verifyOTPAndSignup(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const otpData = otpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
        }

        // Check if OTP has expired
        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Check OTP validity
        if (otpData.otp !== otp.toString()) {
            otpData.attempts += 1;
            if (otpData.attempts >= 3) {
                otpStore.delete(email);
                return res.status(400).json({ message: "Too many incorrect attempts. Please request a new OTP." });
            }
            return res.status(400).json({ message: "Incorrect OTP. Please try again." });
        }

        // OTP is valid, create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(otpData.password, salt);

        const newUser = new User({
            fullName: otpData.fullName,
            email,
            password: hashedPassword,
            isHR: otpData.isHR,
            profileCompleted: false
        });

        await newUser.save();

        // Generate JWT token
        generateToken(newUser._id, res);

        // Delete OTP from store
        otpStore.delete(email);

        res.status(201).json({
            message: "OTP verified successfully. User created.",
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                isHR: newUser.isHR,
                profileCompleted: newUser.profileCompleted
            }
        });
    } catch (error) {
        console.log("Error occurred while verifying OTP and signing up, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Resend OTP
export async function resendOTP(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const otpData = otpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: "No OTP request found for this email. Please sign up again." });
        }

        // Generate new OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // Update OTP store
        otpData.otp = newOTP;
        otpData.expiresAt = Date.now() + 100 * 1000;
        otpData.attempts = 0;

        // Send new OTP email
        await sendOTPEmail(email, otpData.fullName, newOTP);

        res.status(200).json({
            message: "New OTP sent to email. Valid for 100 seconds."
        });
    } catch (error) {
        console.log("Error occurred while resending OTP, Error: ", error.message ?? error.stack ?? error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}