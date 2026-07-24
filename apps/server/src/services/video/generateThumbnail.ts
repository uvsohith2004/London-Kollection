import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function generateThumbnail(inputPath: string): Promise<string> {
  const outputFileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const outputPath = path.join(os.tmpdir(), outputFileName);

  try {
    // Generate a thumbnail at 1 second into the video, or the start if it's shorter.
    await execAsync(`ffmpeg -y -ss 00:00:01 -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`);
    
    // Check if the file was created (if video < 1s, it might fail, fallback to 0s)
    if (!fs.existsSync(outputPath)) {
      await execAsync(`ffmpeg -y -ss 00:00:00 -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`);
    }

    return outputPath;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    // Fallback to 0s just in case
    try {
      await execAsync(`ffmpeg -y -ss 00:00:00 -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`);
      return outputPath;
    } catch (e) {
      throw new Error("Failed to generate video thumbnail.");
    }
  }
}
