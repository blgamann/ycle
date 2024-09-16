import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;

async function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      let newWidth = width;
      let newHeight = height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const aspectRatio = width / height;
        if (aspectRatio > MAX_WIDTH / MAX_HEIGHT) {
          newWidth = MAX_WIDTH;
          newHeight = Math.round(MAX_WIDTH / aspectRatio);
        } else {
          newHeight = MAX_HEIGHT;
          newWidth = Math.round(MAX_HEIGHT * aspectRatio);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error("이미지 리사이즈 실패"));
          }
        },
        file.type,
        0.7
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };

    img.src = url;
  });
}

export async function uploadImage(file) {
  let processedFile = file;

  if (file.size > MAX_FILE_SIZE) {
    try {
      processedFile = await resizeImage(file);
      console.log(
        `파일 크기가 너무 커서 리사이즈됨: ${file.size} → ${processedFile.size}`
      );
    } catch (error) {
      throw new Error("파일 리사이즈 중 오류 발생: " + error.message);
    }
  }

  const fileExt = processedFile.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  let { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, processedFile);

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
