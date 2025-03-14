require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const userRouter = require("./routes/userRoute");
const socketio = require("socket.io");
const socketIO = require("./socket");
const groupRouter = require("./routes/groupRoute");
const messageRouter = require("./routes/messageRoute");

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = socketio(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error("Error in DB Connection:", err.message);
        process.exit(1);
    }
};
connectDB()

// Initialize Socket.io
socketIO(io);

// Routes
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));