import { apiClient } from "./client";

export interface UploadedImage {
  id: string;
  url: string;
  fallbackUrl: string;
}

export async function uploadImage(file: File, postId?: string): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("image", file);
  if (postId) formData.append("postId", postId);

  const { data } = await apiClient.post<UploadedImage>("/admin/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
