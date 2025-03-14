const mongoose = require("mongoose");

//Schema
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    members: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    admin : {
        type: mongoose.Types.ObjectId, 
        ref: "User",
    }
}, {
    timestamps: true,
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;