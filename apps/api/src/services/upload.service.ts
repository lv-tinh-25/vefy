import { getSupabase } from "../lib/supabase";

const BUCKET = "avatars";

/**
 * Upload avatar to Supabase Storage.
 * Accepts a base64 data URL, decodes it, uploads as JPEG, returns public URL.
 * Overwrites existing avatar for the same user.
 */
export async function uploadAvatar(
  userId: string,
  dataUrl: string,
): Promise<string> {
  // Decode base64 data URL → Buffer
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid data URL");

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  const filePath = `${userId}.jpg`;

  // Upload (upsert — overwrite if exists)
  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL with cache-busting timestamp
  const {
    data: { publicUrl },
  } = getSupabase().storage.from(BUCKET).getPublicUrl(filePath);

  return `${publicUrl}?t=${Date.now()}`;
}

/**
 * Delete avatar from Supabase Storage.
 */
export async function deleteAvatar(userId: string): Promise<void> {
  await getSupabase().storage.from(BUCKET).remove([`${userId}.jpg`]);
}
