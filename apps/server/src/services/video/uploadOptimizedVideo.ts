import { CloudflareR2Provider } from "@/modules/providers";
import { validateVideo } from "./validateVideo";
import { generateThumbnail } from "./generateThumbnail";
import { optimizeVideo } from "./optimizeVideo";
import { OptimizedVideoAsset } from "@/db/schemas/video.schema";
import fs from "fs";
import path from "path";
import os from "os";

export async function uploadOptimizedVideo(file: { name: string; buffer: Buffer }, provider: CloudflareR2Provider, preset: string = "video"): Promise<OptimizedVideoAsset> {
  const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.name) || '.mp4'}`);
  let webmPath: string | null = null;
  let mp4Path: string | null = null;
  let thumbPath: string | null = null;

  try {
    // 1. Write buffer to temp file
    fs.writeFileSync(tempInputPath, file.buffer);

    // 2. Validate
    const { width, height, duration } = await validateVideo(tempInputPath);

    // 3. Generate Thumbnail
    thumbPath = await generateThumbnail(tempInputPath);

    // 4. Optimize formats
    const optimized = await optimizeVideo(tempInputPath);
    webmPath = optimized.webmPath;
    mp4Path = optimized.mp4Path;

    // 5. Upload to R2
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const baseKey = `optimized/${preset}/${uniqueId}`;

    const [webmUpload, mp4Upload, thumbUpload] = await Promise.all([
      provider.uploadBuffer(`${baseKey}.webm`, "video/webm", fs.readFileSync(webmPath)),
      provider.uploadBuffer(`${baseKey}.mp4`, "video/mp4", fs.readFileSync(mp4Path)),
      provider.uploadBuffer(`${baseKey}-thumb.jpg`, "image/jpeg", fs.readFileSync(thumbPath))
    ]);

    return {
      webm: {
        key: webmUpload.key,
        url: webmUpload.url,
        sizeBytes: fs.statSync(webmPath).size
      },
      mp4: {
        key: mp4Upload.key,
        url: mp4Upload.url,
        sizeBytes: fs.statSync(mp4Path).size
      },
      thumbnail: {
        key: thumbUpload.key,
        url: thumbUpload.url
      },
      duration,
      width,
      height,
      mimeType: "video/mp4" // Primary fallback mime
    };
  } finally {
    // Cleanup temporary files
    [tempInputPath, webmPath, mp4Path, thumbPath].forEach((p) => {
      if (p && fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch (e) {
          console.error(`Failed to delete temp file ${p}:`, e);
        }
      }
    });
  }
}
