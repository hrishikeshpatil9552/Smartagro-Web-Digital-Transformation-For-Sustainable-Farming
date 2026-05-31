import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Personal Details
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, match: /^[0-9]{10}$/ },
    password: { type: String, required: true, minlength: 6 },
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    dateOfBirth: { type: String, default: "" },
    profilePhoto: { type: String, default: "" }, // base64 or URL
    soilImage: { type: String, default: "" }, // base64 or URL

    // Address
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    taluka: { type: String, default: "" },
    village: { type: String, default: "" },
    pincode: { type: String, default: "" },
    addressDescription: { type: String, default: "" },

    // Farming Details
    farmSize: { type: String, default: "" },
    mainCropType: { type: String, default: "" },
    soilType: { type: String, default: "" },
    preferredLanguage: { type: String, default: "" },
    farmingExperience: { type: String, default: "" },
    irrigationType: { type: String, default: "" },
    waterSource: { type: String, default: "" },
    currentSeasonCrop: { type: [String], default: [] },
    fertilizerUsage: { type: String, default: "" },
    farmMachinery: { type: [String], default: [] },
    notificationMethod: { type: [String], default: [] },

    // Notification toggles
    smsAlerts: { type: Boolean, default: false },
    whatsappAlerts: { type: Boolean, default: false },
    emailAlerts: { type: Boolean, default: false },

    // Activity
    totalQueries: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },

    // AI & Advisory (stored as strings for display)
    lastCropRecommendation: { type: String, default: "" },
    lastDiseaseDetection: { type: String, default: "" },
    lastMarketPricePrediction: { type: String, default: "" },
    governmentSchemeSuggestions: { type: String, default: "" },
    expertConsultationStatus: { type: String, default: "" },

    role: { type: String, default: "farmer" },

    // Dashboard cache (stored after first login, refreshed every 6 months)
    dashWeather: { type: Object, default: null },
    dashMarket: { type: Object, default: null },
    dashCrops: { type: Array, default: null },
    dashLastUpdated: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
