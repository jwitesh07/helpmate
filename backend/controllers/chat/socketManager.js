// controllers/chat/socketManager.js
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const chatDB = require("../../database/chatDB"); // ✅ Adjust this path if your DB folder differs

// 🔒 Authentication middleware (validates JWT before allowing socket connection)
const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            console.warn("⚠️ No token provided during socket handshake");
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        socket.userId = decoded.id || decoded.user_id; // Support both naming conventions
        next();
    } catch (err) {
        console.error("❌ Socket Auth Failed:", err.message);
        return next(new Error("Authentication error: Invalid or expired token"));
    }
};

// 🧩 Initialize and manage Socket.IO connections
const init = (io) => {
    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        const userId = socket.userId;
        console.log(`✅ User ${userId} connected via socket ${socket.id}`);

        // ------------------------------
        // 1️⃣ JOIN ASSIGNMENT CHAT ROOM
        // ------------------------------
        socket.on("joinAssignmentChat", async ({ assignmentId }) => {
            if (!assignmentId) {
                console.warn(`⚠️ joinAssignmentChat called with missing assignmentId`);
                return;
            }

            const roomName = `chat_${assignmentId}`;
            socket.join(roomName);
            console.log(`👥 User ${userId} joined room ${roomName}`);

            try {
                // Fetch previous messages from DB
                const history = await chatDB.getChatHistory(assignmentId);
                socket.emit("chatHistory", { assignmentId, messages: history || [] });
            } catch (error) {
                console.error(`❌ Failed to fetch chat history for ${assignmentId}:`, error.message);
                socket.emit("chatError", { message: "Failed to load chat history." });
            }
        });

        // ------------------------------
        // 2️⃣ HANDLE NEW MESSAGES
        // ------------------------------
        socket.on("sendMessage", async ({ assignmentId, message }) => {
            if (!assignmentId || !message) {
                console.warn("⚠️ Missing assignmentId or message payload");
                return;
            }

            const senderId = socket.userId;
            const roomName = `chat_${assignmentId}`;

            try {
                // Save to database
                const savedMessage = await chatDB.saveMessage(assignmentId, senderId, message);

                // Broadcast to all clients in that room (helper + requester)
                io.to(roomName).emit("newMessage", {
                    ...savedMessage,
                    assignment_id: assignmentId,
                    sender_id: senderId,
                });

                console.log(`💬 Message from ${senderId} sent to ${roomName}`);
            } catch (error) {
                console.error(`❌ Error saving message for ${assignmentId}:`, error.message);
                socket.emit("chatError", { message: "Failed to send message." });
            }
        });

        // ------------------------------
        // 3️⃣ DISCONNECTION HANDLER
        // ------------------------------
        socket.on("disconnect", (reason) => {
            console.log(`❌ User ${userId} disconnected. Reason: ${reason}`);
        });
    });

    console.log("⚡ SocketManager initialized and listening for events");
};

module.exports = { init };
