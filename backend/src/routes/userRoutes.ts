import express from "express";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../middleware/auth";
import User from "../models/user";
import { uploadToCloudinary, deleteFromCloudinaryByUrl, isCloudinaryUrl } from "../utils/cloudinary";

const router = express.Router();

// GET /api/user/profile — fetch full profile
router.get("/profile", authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/profile — update profile (personal + farming details)
router.put("/profile", authenticateToken, async (req: any, res) => {
  try {
    const allowedFields = [
      "name", "phone", "gender", "dateOfBirth", "profilePhoto", "soilImage",
      "state", "district", "taluka", "village", "pincode", "addressDescription",
      "farmSize", "mainCropType", "soilType", "preferredLanguage", "farmingExperience",
      "irrigationType", "waterSource", "currentSeasonCrop", "fertilizerUsage",
      "farmMachinery", "notificationMethod",
      "smsAlerts", "whatsappAlerts", "emailAlerts",
    ];

    // Get current user to check for old images
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const updates: Record<string, any> = {};

    // Handle profilePhoto update with Cloudinary
    if (req.body.profilePhoto !== undefined) {
      const newPhoto = req.body.profilePhoto;
      const oldPhoto = currentUser.profilePhoto;
      // If new photo is base64, upload to Cloudinary
      if (newPhoto && newPhoto.startsWith("data:image")) {
        // Delete old Cloudinary image if exists
        if (oldPhoto && isCloudinaryUrl(oldPhoto)) {
          await deleteFromCloudinaryByUrl(oldPhoto);
        }
        const uploadResult = await uploadToCloudinary(newPhoto, "agrisarthi/profiles");
        updates.profilePhoto = uploadResult.secure_url;
      } else if (newPhoto === "" && oldPhoto && isCloudinaryUrl(oldPhoto)) {
        // If clearing photo, delete from Cloudinary
        await deleteFromCloudinaryByUrl(oldPhoto);
        updates.profilePhoto = "";
      } else {
        updates.profilePhoto = newPhoto;
      }
    }

    // Handle soilImage update with Cloudinary
    if (req.body.soilImage !== undefined) {
      const newSoil = req.body.soilImage;
      const oldSoil = currentUser.soilImage;
      // If new soil image is base64, upload to Cloudinary
      if (newSoil && newSoil.startsWith("data:image")) {
        // Delete old Cloudinary image if exists
        if (oldSoil && isCloudinaryUrl(oldSoil)) {
          await deleteFromCloudinaryByUrl(oldSoil);
        }
        const uploadResult = await uploadToCloudinary(newSoil, "agrisarthi/soils");
        updates.soilImage = uploadResult.secure_url;
      } else if (newSoil === "" && oldSoil && isCloudinaryUrl(oldSoil)) {
        await deleteFromCloudinaryByUrl(oldSoil);
        updates.soilImage = "";
      } else {
        updates.soilImage = newSoil;
      }
    }

    // Handle other allowed fields
    for (const field of allowedFields) {
      if (field !== "profilePhoto" && field !== "soilImage" && req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/user/change-password
router.put("/change-password", authenticateToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields are required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
