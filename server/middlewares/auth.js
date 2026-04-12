const jwt = require("jsonwebtoken");
const User = require("../models/user"); 

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: "Access denied. No token provided." 
            });
        }
        
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedObj;
        
        const user = await User.findById(_id).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, error: "User not found." });
        }

        req.user = user;
        next();
        
    } catch (err) {
        res.status(401).json({
            success: false,
            error: "invalid or expired token",
            details: err.message
        });
    }
};

module.exports = {
    userAuth,
};