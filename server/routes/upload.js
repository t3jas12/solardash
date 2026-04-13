const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const SolarSite = require('../models/solarSite');
const { userAuth } = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/rbac');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const parseCommaNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/,/g, ''));
};

// ==========================================
// SECURE UPLOAD ROUTE (Multi-Sheet & Smart Upsert)
// ==========================================
router.post(
    '/upload-excel', 
    userAuth, 
    authorizeRoles('admin', 'editor'), 
    upload.single('excelFile'), 
    async (req, res) => {
        
        console.log(`Database successfully updated by ${req.user.firstName} (Role: ${req.user.role})`);

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: "Please upload an Excel file." });
            }
            
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            
            // Read all sheets and combine them
            let rawData = [];
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = xlsx.utils.sheet_to_json(worksheet);
                rawData = rawData.concat(sheetData);
            });

            const mappedData = rawData.map(row => {
                const fullLocation = row["Location"] || "";
                const locationParts = fullLocation.split(',');
                const extractedState = locationParts[locationParts.length - 1]?.trim() || "Unknown";
                
                const validStates = ['Uttarakhand', 'State 2', 'State 3', 'State 4', 'State 5']; 
                const statePresence = validStates.includes(extractedState) ? extractedState : 'Other';

                return {
                    siteName: row["Site Name"],
                    category: row["Category"],
                    location: fullLocation,
                    statePresence: statePresence,
                    month: row["Month"],
                    
                    generationKwh: parseCommaNumber(row["Generation (KWH)"]),
                    tariffInr: parseFloat(row["Tariff (INR)"]) || 0,
                    amountInr: parseCommaNumber(row["Amount (INR)"]),
                    acCapacityKw: parseCommaNumber(row["AC Capacity (KW)"]),
                    dcCapacityKw: parseCommaNumber(row["DC Capacity (KW)"]),
                    acCufPercentage: parseFloat(row["AC CUF"]) || 0, 
                    yield: parseFloat(row["Yield (kWh/ KWDC / day)"]) || 0,
                    daysLogged: parseInt(row["Day"]) || 0,
                    
                    status: row["Status"] ? row["Status"].toLowerCase() : "active",
                    
                    co2ReductionTonnes: parseCommaNumber(row["Co2 Reduction Updated CEA Baseline (Tonnes)"]),
                    coalSavingsTonnes: parseCommaNumber(row["Standard Coal Savings (Tonnes)"]),
                    treePlantingEquivalent: parseCommaNumber(row["Equivalent Tree Planting (U.S. EPA Greenhouse Gas Equivalencies Calculator)"])
                };
            });

            const bulkOps = mappedData.map((dataRow) => {
                return {
                    updateOne: {
                        filter: { 
                            siteName: dataRow.siteName, 
                            month: dataRow.month 
                        },
                        update: { $set: dataRow },
                        upsert: true 
                    }
                };
            });

            const result = await SolarSite.bulkWrite(bulkOps);
            
            res.status(201).json({ 
                success: true, 
                message: `Excel data processed successfully across ${workbook.SheetNames.length} sheets.`,
                stats: {
                    newLogsAdded: result.upsertedCount,
                    existingLogsUpdated: result.modifiedCount
                }
            });

        } catch (error) {
            console.error("Error caught during upload:", error.message);
            res.status(500).json({ 
                success: false, 
                error: "Failed to process Excel file.", 
                details: error.message 
            });
        }
    }
);

module.exports = router;