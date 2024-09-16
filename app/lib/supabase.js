import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  let { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteImage(imagePath) {
  const { error } = await supabase.storage.from(bucket).remove([imagePath]);

  if (error) {
    throw error;
  }
}
