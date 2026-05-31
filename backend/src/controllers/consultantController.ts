import { Request, Response } from 'express';
import Consultant from "../models/Consultant";
import { uploadToCloudinary, deleteFromCloudinaryByUrl, isCloudinaryUrl } from "../utils/cloudinary";

// 1. Add Consultant (with Cloudinary image upload)
export const addConsultant = async (req: Request, res: Response) => {
  try {
    let consultantData = { ...req.body };

    // Upload image to Cloudinary if provided as base64
    if (req.body.image && req.body.image.startsWith("data:image")) {
      try {
        const uploadResult = await uploadToCloudinary(req.body.image, "agrisarthi/consultants");
        consultantData.image = uploadResult.secure_url;
      } catch (err) {
        console.error("Failed to upload consultant image to Cloudinary:", err);
      }
    }

    const newConsultant = new Consultant(consultantData);
    await newConsultant.save();
    res.status(201).json({ message: 'Consultant added successfully', consultant: newConsultant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add consultant', details: error });
  }
};

// 2. Get Consultants (With Optional Filters)
export const getConsultants = async (req: Request, res: Response) => {
  try {
    const { state, district, expertise, crop } = req.query;

    let query: any = {};

    // Only add to query if the value exists and is not "All" or empty string
    if (state && state !== 'All' && state !== '') {
        // Case-insensitive regex for better search
        query.state = { $regex: new RegExp(state as string, 'i') };
    }
    if (district && district !== 'All' && district !== '') {
        query.district = { $regex: new RegExp(district as string, 'i') };
    }

    // If 'crop' is provided, search across BOTH expertise and cropSpecializations using $or
    // This allows users to find consultants whose main expertise OR cropSpecializations match
    if (crop && crop !== 'All' && crop !== '') {
      const cropRegex = new RegExp(crop as string, 'i');
      query.$or = [
        { expertise: { $regex: cropRegex } },
        { cropSpecializations: { $regex: cropRegex } }
      ];
    } else if (expertise && expertise !== 'All' && expertise !== '') {
      // Only use expertise filter if no crop filter is provided
      query.expertise = { $regex: new RegExp(expertise as string, 'i') };
    }

    const consultants = await Consultant.find(query).sort({ createdAt: -1 });
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultants' });
  }
};

// 3. Update Consultant (with Cloudinary image handling)
export const updateConsultant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Get current consultant to check for old image
    const currentConsultant = await Consultant.findById(id);
    if (!currentConsultant) {
      return res.status(404).json({ error: 'Consultant not found' });
    }

    // Handle image update with Cloudinary
    if (req.body.image !== undefined) {
      const newImage = req.body.image;
      const oldImage = currentConsultant.image;

      // If new image is base64, upload to Cloudinary
      if (newImage && newImage.startsWith("data:image")) {
        // Delete old Cloudinary image if exists
        if (oldImage && isCloudinaryUrl(oldImage)) {
          await deleteFromCloudinaryByUrl(oldImage);
        }
        const uploadResult = await uploadToCloudinary(newImage, "agrisarthi/consultants");
        updateData.image = uploadResult.secure_url;
      } else if (newImage === "" && oldImage && isCloudinaryUrl(oldImage)) {
        // If clearing image, delete from Cloudinary
        await deleteFromCloudinaryByUrl(oldImage);
        updateData.image = "";
      }
    }

    const updatedConsultant = await Consultant.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({ message: 'Updated successfully', consultant: updatedConsultant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update consultant' });
  }
};

// 4. Delete Consultant (with Cloudinary cleanup)
export const deleteConsultant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const consultant = await Consultant.findById(id);

    if (!consultant) {
      return res.status(404).json({ error: 'Consultant not found' });
    }

    // Delete image from Cloudinary if it exists
    if (consultant.image && isCloudinaryUrl(consultant.image)) {
      await deleteFromCloudinaryByUrl(consultant.image);
    }

    await Consultant.findByIdAndDelete(id);
    res.json({ message: 'Consultant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete consultant' });
  }
};
