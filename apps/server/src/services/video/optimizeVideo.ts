import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function optimizeVideo(inputPath: string) {
  const baseName = `opt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const webmPath = path.join(os.tmpdir(), `${baseName}.webm`);
  const mp4Path = path.join(os.tmpdir(), `${baseName}.mp4`);

  // Max 1080p, maintaining aspect ratio. 
  // -vf "scale='min(1920,iw)':-2" resizes width to 1920 max, and height is calculated automatically to keep AR (must be even).
  const scaleFilter = `-vf "scale='min(1920,iw)':-2"`;

  try {
    // 1. Generate WebM (AV1)
    // Using libsvtav1 for AV1 encoding. Preset 8 is a good balance for speed/quality.
    await execAsync(
      `ffmpeg -y -i "${inputPath}" ${scaleFilter} -c:v libsvtav1 -preset 8 -crf 35 -c:a libopus -b:a 128k "${webmPath}"`
    );

    // 2. Generate MP4 (H.264 fallback)
    // Using libx264, slow preset, CRF 23, faststart for web streaming.
    await execAsync(
      `ffmpeg -y -i "${inputPath}" ${scaleFilter} -c:v libx264 -preset slow -crf 23 -movflags +faststart -c:a aac -b:a 128k "${mp4Path}"`
    );

    return { webmPath, mp4Path };
  } catch (error) {
    console.error("Video optimization failed:", error);
    throw new Error("Failed to optimize video files.");
  }
}
