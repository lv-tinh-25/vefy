import { getSupabase } from "../lib/supabase";

const BUCKET = "avatars";

/**
 * Upload a base64 data URL as JPEG to Supabase Storage, overwriting the file at `filePath`.
 * Returns the public URL with a cache-busting timestamp.
 */
async function uploadImage(filePath: string, dataUrl: string): Promise<string> {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");

  const buffer = Buffer.from(matches[2], "base64");

  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = getSupabase().storage.from(BUCKET).getPublicUrl(filePath);

  return `${publicUrl}?t=${Date.now()}`;
}

async function deleteImage(filePath: string): Promise<void> {
  await getSupabase().storage.from(BUCKET).remove([filePath]);
}

const avatarPath = (userId: string) => `${userId}.jpg`;
const vehicleImagePath = (vehicleId: string) => `vehicles/${vehicleId}.jpg`;

export const uploadAvatar = (userId: string, dataUrl: string) => uploadImage(avatarPath(userId), dataUrl);
export const deleteAvatar = (userId: string) => deleteImage(avatarPath(userId));

export const uploadVehicleImage = (vehicleId: string, dataUrl: string) =>
  uploadImage(vehicleImagePath(vehicleId), dataUrl);
export const deleteVehicleImage = (vehicleId: string) => deleteImage(vehicleImagePath(vehicleId));
