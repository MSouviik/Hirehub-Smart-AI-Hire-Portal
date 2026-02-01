import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

export async function isUserAuthenticated(req, res, next) {
    try {
        const token = req.cookies.jwt;

        if (!token)
            return res.status(401).json({ message: "Unauthorized Access - No token provided." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded)
            return res.status(401).json({ message: "Unauthorized Access - Invalid Token." });

        const user = await User.findById(decoded.userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found." });

        req.user = user;

        next();
    } catch (error) {
        console.log("Error occured while middleware authentication, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}