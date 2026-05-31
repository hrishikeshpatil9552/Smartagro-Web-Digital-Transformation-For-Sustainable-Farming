import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { uploadToCloudinary } from "../utils/cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// ---------------- REGISTER ----------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name, email, phone, password, confirmPassword,
      gender, dateOfBirth, profilePhoto, soilImage,
      state, district, taluka, village, pincode, addressDescription,
      farmSize, mainCropType, soilType, preferredLanguage, farmingExperience,
      irrigationType, waterSource, currentSeasonCrop, fertilizerUsage,
      farmMachinery, notificationMethod,
    } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword)
      return res.status(400).json({ message: "Required fields are missing" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload images to Cloudinary if provided
    let profilePhotoUrl = profilePhoto || "";
    let soilImageUrl = soilImage || "";

    if (profilePhoto && profilePhoto.startsWith("data:image")) {
      try {
        const uploadResult = await uploadToCloudinary(profilePhoto, "agrisarthi/profiles");
        profilePhotoUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Failed to upload profile photo to Cloudinary:", err);
      }
    }

    if (soilImage && soilImage.startsWith("data:image")) {
      try {
        const uploadResult = await uploadToCloudinary(soilImage, "agrisarthi/soils");
        soilImageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Failed to upload soil image to Cloudinary:", err);
      }
    }

    const user = await User.create({
      name, email, phone, password: hashedPassword,
      gender: gender || "",
      dateOfBirth: dateOfBirth || "",
      profilePhoto: profilePhotoUrl,
      soilImage: soilImageUrl,
      state: state || "", district: district || "",
      taluka: taluka || "", village: village || "",
      pincode: pincode || "", addressDescription: addressDescription || "",
      farmSize: farmSize || "", mainCropType: mainCropType || "",
      soilType: soilType || "", preferredLanguage: preferredLanguage || "",
      farmingExperience: farmingExperience || "", irrigationType: irrigationType || "",
      waterSource: waterSource || "", currentSeasonCrop: Array.isArray(currentSeasonCrop) ? currentSeasonCrop : [],
      fertilizerUsage: fertilizerUsage || "",
      farmMachinery: farmMachinery || [],
      notificationMethod: notificationMethod || [],
      role: "farmer",
      lastLogin: new Date(),
    });

    const token = jwt.sign({ id: user._id, role: "farmer" }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "farmer",
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- LOGIN ----------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Admin trap door
    const ADMIN_EMAIL = "admin@agrisarthi.com";
    const ADMIN_PASS = "admin123";
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const token = jwt.sign({ id: "admin_master_id", role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: { id: "admin_master_id", name: "Super Admin", email: ADMIN_EMAIL, role: "admin" },
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Update lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = jwt.sign({ id: user._id, role: "farmer" }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: "farmer" },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
