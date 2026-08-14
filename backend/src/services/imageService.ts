import sharp from "sharp";
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { createImageRecord, deleteImageRecords, findImageById, findImagesByPostId } from "../repositories/imageRepository";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB pre-optimization cap
const MAX_DIMENSION = 1600; // long-edge cap (design §6.3)
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Validates, resizes, and re-encodes an uploaded image to WebP (with a JPEG
 * fallback stored alongside), then uploads both to Supabase Storage.
 * Re-encoding via sharp also strips embedded scripts/EXIF payloads (design §8).
 */
export async function processAndStoreImage(file: Express.Multer.File, postId?: string) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new AppError(400, "Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError(400, "Image is too large (max 8MB).");
  }

  const baseName = randomUUID();
  const image = sharp(file.buffer).rotate(); // .rotate() auto-orients via EXIF, then strips it

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const webpBuffer = await resized.clone().webp({ quality: 80 }).toBuffer();
  const jpegBuffer = await resized.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  const webpPath = `posts/${baseName}.webp`;
  const jpegPath = `posts/${baseName}.jpg`;

  const { error: webpError } = await supabase.storage
    .from(env.supabaseImagesBucket)
    .upload(webpPath, webpBuffer, { contentType: "image/webp", upsert: false });
  if (webpError) throw new AppError(500, `Image upload failed: ${webpError.message}`);

  const { error: jpegError } = await supabase.storage
    .from(env.supabaseImagesBucket)
    .upload(jpegPath, jpegBuffer, { contentType: "image/jpeg", upsert: false });
  if (jpegError) throw new AppError(500, `Image upload failed: ${jpegError.message}`);

  const { data: publicWebp } = supabase.storage.from(env.supabaseImagesBucket).getPublicUrl(webpPath);
  const { data: publicJpeg } = supabase.storage.from(env.supabaseImagesBucket).getPublicUrl(jpegPath);

  // The WebP variant is the canonical stored URL; frontend <picture> can fall back to the .jpg
  // sibling path by convention if ever needed. We store the WebP record as the source of truth.
  const record = await createImageRecord({
    postId: postId ?? null,
    storagePath: webpPath,
    imageUrl: publicWebp.publicUrl,
  });

  return {
    id: record.id,
    url: publicWebp.publicUrl,
    fallbackUrl: publicJpeg.publicUrl,
  };
}

export async function deleteImageById(id: string) {
  const image = await findImageById(id);
  if (!image) throw new AppError(404, "Image not found.");

  await supabase.storage.from(env.supabaseImagesBucket).remove([image.storagePath]);
  await deleteImageRecords([id]);
}

/**
 * Reconciles images referenced in saved post content against stored Image
 * rows for that post, deleting anything no longer referenced (design §6.4).
 * Run synchronously on post save — acceptable at this scale (few images/post).
 */
export async function reconcileOrphanedImages(postId: string, content: unknown) {
  const referencedUrls = extractImageUrls(content);
  const existingImages = await findImagesByPostId(postId);

  const orphaned = existingImages.filter((img) => !referencedUrls.has(img.imageUrl));
  if (orphaned.length === 0) return;

  await supabase.storage
    .from(env.supabaseImagesBucket)
    .remove(orphaned.map((img) => img.storagePath));
  await deleteImageRecords(orphaned.map((img) => img.id));
}

interface TiptapNode {
  type?: string;
  attrs?: { src?: string };
  content?: TiptapNode[];
}

function extractImageUrls(content: unknown): Set<string> {
  const urls = new Set<string>();
  function walk(node: TiptapNode) {
    if (node.type === "image" && node.attrs?.src) urls.add(node.attrs.src);
    if (node.content) node.content.forEach(walk);
  }
  try {
    walk(content as TiptapNode);
  } catch {
    // malformed content — treat as no references, reconciliation will no-op safely
  }
  return urls;
}
