import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { BadRequestError } from "@/core/errors";

const execAsync = promisify(exec);

export async function validateVideo(filePath: string) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    const output = stdout.trim().split("\n");
    if (output.length < 3) {
      // ffprobe might fail if it's not a valid video or has no video stream
      throw new BadRequestError("Invalid video file.");
    }
    const width = parseInt(output[0].trim(), 10);
    const height = parseInt(output[1].trim(), 10);
    const duration = parseFloat(output[2].trim());

    if (isNaN(duration) || duration > 30) {
      throw new BadRequestError("Video duration must not exceed 30 seconds.");
    }

    const stat = fs.statSync(filePath);
    if (stat.size > 100 * 1024 * 1024) {
      throw new BadRequestError("Video file size must not exceed 100 MB.");
    }

    return { width, height, duration, size: stat.size };
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    console.error("Video validation error:", error);
    throw new BadRequestError("Could not validate video file.");
  }
}
