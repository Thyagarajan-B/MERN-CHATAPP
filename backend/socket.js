const jwt = require("jsonwebtoken");

const connectedUsers = new Map(); // Store connected users

const socketIO = (io) => {
    io.on("connection", (socket) => {
        try {
            // Extract token and user info from handshake auth
            const { token, user } = socket.handshake.auth;

            console.log("Received Token:", token);
            console.log("Received User Info:", user);

            if (!token) {
                console.log("❌ No token provided, disconnecting socket.");
                socket.disconnect();
                return;
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ Decoded Token:", decoded);

            // Ensure user object exists and matches decoded token ID
            if (!user || !user._id || user._id.toString() !== decoded.id.toString()) {
                console.log("❌ Invalid token or user info, disconnecting socket.");
                socket.disconnect();
                return;
            }

            console.log(`🔵 User Connected: ${user.userName}, Socket ID: ${socket.id}`);

            // Store user and their socket ID
            connectedUsers.set(socket.id, { user, room: null });

            // Handle joining a room
            socket.on("join room", (groupId) => {
                console.log(`${user.userName} joining room:`, groupId);

                if (!groupId) {
                    console.log("❌ Invalid room ID, skipping join.");
                    return;
                }

                socket.join(groupId);
                connectedUsers.set(socket.id, { user, room: groupId });

                // Get the list of users in the room
                const usersInRoom = Array.from(connectedUsers.values())
                    .filter((u) => u.room === groupId && u.user?.userName)
                    .map((u) => u.user);

                console.log("Emitting 'users in room' with:", usersInRoom);
                io.to(groupId).emit("users in room", usersInRoom);

                // Notify others
                socket.to(groupId).emit("notification", {
                    type: "USER_JOINED",
                    message: `${user.userName} has joined`,
                    user,
                });
            });

            // Handle leaving a room
            socket.on("leave room", (groupId) => {
                console.log(`${user.userName} leaving room:`, groupId);
                socket.leave(groupId);

                if (connectedUsers.has(socket.id)) {
                    connectedUsers.delete(socket.id);

                    // Get updated user list
                    const usersInRoom = Array.from(connectedUsers.values())
                        .filter((u) => u.room === groupId && u.user?.userName)
                        .map((u) => u.user);

                    io.in(groupId).emit("users in room", usersInRoom);
                    socket.to(groupId).emit("user left", user._id);
                }
            });

            // Handle disconnect
            socket.on("disconnect", () => {
                console.log(`${user.userName} disconnected`);
                const userData = connectedUsers.get(socket.id);

                if (userData) {
                    socket.to(userData.room).emit("user left", user._id);
                    connectedUsers.delete(socket.id);
                }
            });

            // Typing indicator
            socket.on("typing", ({ groupId, username }) => {
                socket.to(groupId).emit("user typing", {username});
            });

            socket.on("stop typing", ({ groupId }) => {
                socket.to(groupId).emit("user stop typing", { userName: user.userName });
            });

        } catch (error) {
            console.log("❌ Socket authentication error:", error.message);
            socket.disconnect();
        }
    });
};

module.exports = socketIO;
