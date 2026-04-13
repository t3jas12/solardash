const express = require('express');
const SolarSite = require('../models/solarSite');
const { userAuth } = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/rbac');

const router = express.Router();

//solar site edit api 

router.patch('/site/edit/:id', userAuth, authorizeRoles('admin', 'editor'), async (req, res) => {
    try {
        const { id } = req.params;

        const updatedSite = await SolarSite.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!updatedSite) {
            return res.status(404).json({ success: false, error: "Solar site not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Site updated successfully.", 
            site: updatedSite 
        });

    } catch (error) {
        // console.error("Edit error:", err.message);
        res.status(400).json({ success: false, error: "Failed to update site.", details: error.message });
    }
});

//delete api 

router.delete('/site/delete/:id', userAuth, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSite = await SolarSite.findByIdAndDelete(id);

        if (!deletedSite) {
            return res.status(404).json({ success: false, error: "Solar site not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Site deleted successfully." 
        });

    } catch (error) {
        // console.error("Delete error:", err.message);
        res.status(500).json({ success: false, error: "Server error during deletion." });
    }
});

module.exports = router;