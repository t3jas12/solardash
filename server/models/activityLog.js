const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    userEmail: { 
        type: String, 
        required: true 
    },
    action: { 
        type: String, 
        enum: ['LOGIN', 'LOGOUT'], 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);