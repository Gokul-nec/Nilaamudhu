import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "m9plcftb";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "nilaamudhu_products";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder = "nilaamudhu/products"
): Promise<{ url: string; public_id: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are not configured. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env.local file."
    );
  }

  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      upload_preset: uploadPreset,
      resource_type: "image",
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error?: Error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed with empty result."));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary };
