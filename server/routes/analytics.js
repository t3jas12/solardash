const express = require('express');
const router = express.Router();
const SolarSite = require('../models/solarSite');
const { userAuth } = require('../middlewares/auth');

// HELPER: Converts a Calendar Year into an Excel Serial Number range
const getYearBoundaries = (year) => {
    const epoch = new Date(Date.UTC(1899, 11, 30)); 
    const start = Math.floor((new Date(Date.UTC(year, 0, 1)) - epoch) / 86400000);
    const end = Math.floor((new Date(Date.UTC(year, 11, 31)) - epoch) / 86400000);
    return { start: start.toString(), end: end.toString() };
};

// HELPER: Converts a specific Month & Year into an Excel Serial Number range
const getMonthBoundaries = (year, monthIndex) => {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const start = Math.floor((new Date(Date.UTC(year, monthIndex, 1)) - epoch) / 86400000);
    const end = Math.floor((new Date(Date.UTC(year, monthIndex + 1, 0)) - epoch) / 86400000);
    return { start: start.toString(), end: end.toString() };
};

// Reusable function to build the Match stage based on Year and Month filters
const buildTimeMatchStage = (year, month) => {
    const matchStage = {};
    const currentYear = new Date().getFullYear();

    if (year !== 'All' && month !== 'All') {
        // Specific Month AND Year (e.g., March 2024)
        const bounds = getMonthBoundaries(parseInt(year), parseInt(month));
        matchStage.month = { $gte: bounds.start, $lte: bounds.end };
    } else if (year !== 'All' && month === 'All') {
        // Entire Year (e.g., All of 2024)
        const bounds = getYearBoundaries(parseInt(year));
        matchStage.month = { $gte: bounds.start, $lte: bounds.end };
    } else if (year === 'All' && month !== 'All') {
        // Specific Month across ALL Years (e.g., Every March from 2017 to Now)
        const orConditions = [];
        const monthIdx = parseInt(month);
        for (let y = 2017; y <= currentYear; y++) {
            const bounds = getMonthBoundaries(y, monthIdx);
            orConditions.push({ month: { $gte: bounds.start, $lte: bounds.end } });
        }
        if (orConditions.length > 0) matchStage.$or = orConditions;
    }
    return matchStage;
};

// ==========================================
// 1. FETCH AVAILABLE SITES (State filter removed)
// ==========================================
router.get('/analytics/sites', userAuth, async (req, res) => {
    try {
        const sites = await SolarSite.distinct("siteName");
        res.status(200).json({ success: true, data: sites.sort() });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch sites." });
    }
});

// ==========================================
// 2. SYSTEM KPI ANALYTICS 
// ==========================================
router.get('/analytics/kpi', userAuth, async (req, res) => {
    try {
        const { siteName, year, month } = req.query;
        
        const matchStage = buildTimeMatchStage(year, month);
        if (siteName && siteName !== 'All') matchStage.siteName = siteName;

        const metrics = await SolarSite.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$siteName",
                    siteGeneration: { $sum: "$generationKwh" },
                    siteRevenue: { $sum: "$amountInr" },
                    siteCO2: { $sum: "$co2ReductionTonnes" },
                    siteTrees: { $sum: "$treePlantingEquivalent" },
                    siteCoal: { $sum: "$coalSavingsTonnes" }, 
                    siteYield: { $avg: "$yield" },            
                    siteCUF: { $avg: "$acCufPercentage" },    
                    siteCapacity: { $max: "$dcCapacityKwp" } 
                }
            },
            {
                $group: {
                    _id: null,
                    totalSitesCount: { $sum: 1 }, 
                    totalGeneration: { $sum: "$siteGeneration" },
                    totalRevenue: { $sum: "$siteRevenue" },
                    totalCO2: { $sum: "$siteCO2" },
                    totalTrees: { $sum: "$siteTrees" },
                    totalCoal: { $sum: "$siteCoal" },         
                    avgYield: { $avg: "$siteYield" },         
                    avgCUF: { $avg: "$siteCUF" },             
                    totalCapacity: { $sum: "$siteCapacity" }
                }
            }
        ]);

        if (metrics.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: { totalSitesCount: 0, totalGeneration: 0, totalRevenue: 0, totalCO2: 0, totalTrees: 0, totalCoal: 0, avgYield: 0, avgCUF: 0, totalCapacity: 0 } 
            });
        }

        res.status(200).json({ success: true, data: metrics[0] });

    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to crunch KPI data." });
    }
});

// ==========================================
// 3. CHART DATA 
// ==========================================
router.get('/analytics/charts', userAuth, async (req, res) => {
    try {
        const { siteName, year, month } = req.query;
        
        const matchStage = buildTimeMatchStage(year, month);
        if (siteName && siteName !== 'All') matchStage.siteName = siteName;

        const chartData = await SolarSite.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$month",
                    monthlyGeneration: { $sum: "$generationKwh" },
                    monthlyRevenue: { $sum: "$amountInr" },
                    monthlyYield: { $avg: "$yield" }, 
                    monthlyCO2: { $sum: "$co2ReductionTonnes" },
                    monthlyTrees: { $sum: "$treePlantingEquivalent" },
                    monthlyCoal: { $sum: "$coalSavingsTonnes" }
                }
            },
            { $addFields: { sortableMonth: { $toInt: "$_id" } } },
            { $sort: { sortableMonth: 1 } }
        ]);

        res.status(200).json({ success: true, data: chartData });

    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch chart data." });
    }
});

module.exports = router;