import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
export const BUCKET = "qr-files";

export async function uploadQrFile(file: File): Promise<{ url: string; path: string }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is larger than 500 MB");
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("Please log in to upload files");

  const ext = file.name.includes(".") ? file.name.split(".").pop()!.slice(0, 10) : "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return { url: `${origin}/f/${path}`, path };
}

