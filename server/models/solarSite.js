const mongoose = require("mongoose");

const solarSiteSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
    },
    category: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    statePresence: {
      type: String,
      required: true,
    //   enum: {
    //     // custom error message, might use it later
    //     values: ["Uttarakhand", "State 2", "State 3", "State 4", "State 5"], 
    //     message: `{VALUE} is not an authorized service state`,
    //   },
    },
    month: {
      type: String,
    },
    generationKwh: {
      type: Number,
      required: true,
      min: [0, "Generation cannot be negative"], // hardware safety check
    },
    tariffInr: {
      type: Number,
      min: 0,
    },
    amountInr: {
      type: Number,
      min: 0,
    },
    acCapacityKw: {
      type: Number,
      min: 0,
    },
    dcCapacityKw: {
      type: Number,
      min: 0,
    },
    acCufPercentage: {
      type: Number,
      min: 0,
      max: 100, // percentage cannot exceed 100%
    },
    yield: {
      type: Number,
      min: 0,
    },
    daysLogged: {
      type: Number,
      min: 1,
      max: 31,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "maintenance", "offline"],
        message: `{VALUE} is not a valid hardware status`,
      },
      default: "Active",
    },
    // environmental KPIs
    co2ReductionTonnes: { type: Number, min: 0 },
    coalSavingsTonnes: { type: Number, min: 0 },
    treePlantingEquivalent: { type: Number, min: 0 },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("SolarSite", solarSiteSchema);