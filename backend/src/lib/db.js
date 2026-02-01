import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_CONNECTION_URI);
        console.log(`MongoDB Connected Successfully on: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error occured while connecting to database", error);
        process.exit(1);
    }
};