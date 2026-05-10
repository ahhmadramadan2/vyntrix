import { env } from "../config/env";

/**
 * Upload a file buffer to a Supabase Storage bucket using the service role key
 * (which bypasses RLS, so no bucket policies are needed for INSERT).
 *
 * The bucket must exist and be marked as Public in the Supabase dashboard
 * so that the returned public URL can be opened directly by HR.
 */
export const uploadToSupabaseStorage = async (
  bucket: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> => {
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Upload failed");
    throw new Error(`Supabase upload failed: ${res.status} ${errText}`);
  }

  // Public URL pattern for a public bucket
  return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
};
