const express = require("express");
const User = require("../models/user"); 

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { 
        firstName, 
        lastName, 
        emailId, 
        password, 
        role
    } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email is already registered." });
    }

    const user = new User({
      firstName,
      lastName,
      emailId,
      password, 
      role 
    });

    await user.save();

    //generate jwt 
    const token = await user.getJWT();
    
    //attach token to cookie 
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User Added successfully!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role
      }
    });

  } catch (err) {
//catch err if mongoose rejects data
    res.status(400).json({ 
        success: false,
        error: err.message
    });
  }
});

module.exports = authRouter;