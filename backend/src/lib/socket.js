import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

const webSockets = new Server(server, {
    cors: { origin: ["http://localhost:5173"], },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
};

//for storing online users
const userSocketMap = {} // {userId: socket.id}

webSockets.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    //for broadcasting events to all connected clients
    webSockets.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];

        webSockets.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
});

export { webSockets, app, server };