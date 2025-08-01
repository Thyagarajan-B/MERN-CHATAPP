const express = require("express");
const Message = require("../models/chatModel");
const {protect} = require("../middlewares/authMiddleware");

const messageRouter = express.Router()

// Send Message
messageRouter.post("/", protect, async(req, res)=>{
    try {
        const {content, groupId} = req.body;
        const message = await Message.create({
            sender: req.user._id,
            content,
            group:groupId,
        });
        const populatedMessage = await Message.findById(message._id).populate(
            "sender",
            "username email"
        );
        res.json(populatedMessage)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
});

//Get message for group
messageRouter.get("/:groupId", protect, async(req, res)=>{
    try {
        const messages = await Message.find({group: req.params.groupId}).populate(
            "sender",
            "username email"
        ).sort({createdAt : -1});
        res.json(messages);
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})
module.exports = messageRouter;