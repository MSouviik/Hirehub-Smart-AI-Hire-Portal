import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, webSockets } from "../lib/socket.js";
import imagekit from "../lib/imagekit.js";


export async function getUsersForSidebar(req, res) {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error occured while fetching users for sidebar, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getAllUserMessages(req, res) {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const allMessages = await Message.find({ // fetching all messages of my and active user
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(allMessages);
    } catch (error) {
        console.log("Error occured while fetching messages, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function sendMessageToUser(req, res) {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params; // receiver user id
        const senderId = req.user._id; // logged-in user id

        let imageUrl;

        if (image) {
            // Upload base64 image to ImageKit
            const uploadResponse = await imagekit.upload({
                file: image,                              // base64 string
                fileName: `chat_${Date.now()}.jpg`,       // random file name
                folder: `hirehub/chats/${senderId}`,      // optional folder structure
            });

            imageUrl = uploadResponse.url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl || null,
        });

        await newMessage.save();

        // Send real-time message to receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            webSockets.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error(
            "Error occurred while sending messages to user, Error:",
            error.message || error
        );
        res.status(500).json({ message: "Internal Server Error" });
    }
}