const express = require("express");
const User = require("../models/user"); 
const { userAuth } = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/rbac");
const user = require("../models/user");
const ActivityLog = require("../models/activityLog");

const authRouter = express.Router();

//signup api 

authRouter.post("/signup", userAuth, authorizeRoles('admin'), async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, role } = req.body;

        // ... your existing validation logic ...

        // Hash the password and save
        const user = new User({ firstName, lastName, emailId, password, role });
        await user.save();
        
        res.status(201).json({ 
            success: true, 
            message: "User created successfully." 
        });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// FETCH SYSTEM LOGS (Admin Only)
authRouter.get("/logs", userAuth, authorizeRoles('admin'), async (req, res) => {
    try {
        // Fetch the 100 most recent logs
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch system logs." });
    }
});

//login api

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials." });
    }

    const token = await user.getJWT();

    await ActivityLog.create({
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.emailId,
        action: 'LOGIN'
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000
    });

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
    // console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
});

//logout api 
 
authRouter.post("/logout", async (req, res) => {
  try {
      const { token } = req.cookies;
      
      // only log if token exists and is valid
      if (token) {
          try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const user = await User.findById(decoded._id);
              if (user) {
                  await ActivityLog.create({
                      userId: user._id,
                      userName: `${user.firstName} ${user.lastName}`,
                      userEmail: user.emailId,
                      action: 'LOGOUT'
                  });
              }
          } catch (e) {
              // token expired or invalid, skip logging but clear cookie
          }
      }

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      
      res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
      res.status(500).json({ success: false, error: "Failed to process logout." });
  }
});


// GET ALL USERS API
authRouter.get("/users", userAuth, authorizeRoles('admin'), async (req, res) => {
    try {
        // Find all users but explicitly exclude the password field for security
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            data: users 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch users." 
        });
    }
});

//user edit api 
authRouter.patch("/edit/:id", userAuth, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const requestingUser = req.user;

        if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== targetUserId) {
            return res.status(403).json({ success: false, error: "Not authorized to edit this user." });
        }

        const userToUpdate = await User.findById(targetUserId);
        if (!userToUpdate) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        const { firstName, lastName, role, password } = req.body;
        if (firstName) userToUpdate.firstName = firstName;
        if (lastName) userToUpdate.lastName = lastName;

        // admin perk
        if (role && requestingUser.role === 'admin') {
            userToUpdate.role = role;
        }

        if (password) {
            userToUpdate.password = password;
        }
        await userToUpdate.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user: {
                _id: userToUpdate._id,
                firstName: userToUpdate.firstName,
                lastName: userToUpdate.lastName,
                emailId: userToUpdate.emailId,
                role: userToUpdate.role
            }
        });
    } catch (error) {
        res.status(400).json({
          success: false,
          error: "Failed to update user.", 
          details: error.message
        });
    }
});

//delete user api
authRouter.delete("/delete/:id", userAuth, authorizeRoles('admin'), async (req, res) => {
    try {
        const targetUserId = req.params.id;

        if (req.user._id.toString() === targetUserId) {
            return res.status(400).json({ 
                success: false, 
                error: "You cannot delete your own admin account." 
            });
        }

        const deletedUser = await User.findByIdAndDelete(targetUserId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, error: "User not found." });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    } catch (error) {
        // console.error("Delete user error:", err.message);
        res.status(500).json({ 
          success: false, 
          error: "Server error during deletion." 
        });
    }
});

module.exports = authRouter;