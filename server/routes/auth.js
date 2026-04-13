const express = require("express");
const User = require("../models/user"); 
const { userAuth } = require("../middlewares/auth");

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

//login api

authRouter.post("/login", userAuth, async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // 1. Check if the user actually exists in the database
    const user = await User.findOne({ emailId });
    if (!user) {
      // We use a generic message for both wrong email and wrong password 
      // so attackers can't guess which emails are registered.
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // 2. Validate the password using your custom schema method
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    // 3. Generate a fresh JWT 
    const token = await user.getJWT();

    // 4. Set the secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 5. Send back the scrubbed user data for React to use in its global state
    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
});

module.exports = authRouter;