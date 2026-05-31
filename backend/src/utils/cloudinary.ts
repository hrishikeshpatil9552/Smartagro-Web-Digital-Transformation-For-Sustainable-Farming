import cloudinary from '../config/cloudinary';

/**
 * Upload a base64 image string to Cloudinary
 * @param base64Image - The base64 data URI of the image
 * @param folder - Cloudinary folder name (e.g., 'agrisarthi/profiles')
 * @returns Promise with secure_url and public_id
 */
export const uploadToCloudinary = async (
  base64Image: string,
  folder: string = 'agrisarthi'
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary by public_id
 * @param publicId - The Cloudinary public_id of the image
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw — deletion failures shouldn't break the flow
  }
};

/**
 * Extract public_id from a Cloudinary secure URL
 * Example URL: https://res.cloudinary.com/dlgp9uqnk/image/upload/v1234567890/agrisarthi/profiles/abc123.jpg
 * Returns: agrisarthi/profiles/abc123
 * @param url - Cloudinary secure_url
 * @returns public_id string or null
 */
export const extractPublicId = (url: string): string | null => {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    // Remove query params
    const cleanUrl = url.split('?')[0];
    // Split by /upload/ to get the path after upload
    const parts = cleanUrl.split('/upload/');
    if (parts.length < 2) return null;
    // Remove version number (v1234567890/) if present
    let path = parts[1];
    if (path.startsWith('v')) {
      path = path.replace(/^v\d+\//, '');
    }
    // Remove file extension
    const lastDot = path.lastIndexOf('.');
    if (lastDot > -1) {
      path = path.substring(0, lastDot);
    }
    return path;
  } catch {
    return null;
  }
};

/**
 * Check if a URL is a Cloudinary URL
 * @param url - URL string to check
 * @returns boolean
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return !!url && url.includes('res.cloudinary.com');
};

/**
 * Delete image from Cloudinary by URL (extracts public_id automatically)
 * @param url - Cloudinary secure_url
 */
export const deleteFromCloudinaryByUrl = async (url: string): Promise<void> => {
  const publicId = extractPublicId(url);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
};

