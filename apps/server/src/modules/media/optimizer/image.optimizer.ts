import sharp from "sharp"
import { CloudflareR2Provider } from "../../providers"
import { BadRequestError } from "@/core/errors"

export type ImagePreset = "avatar" | "product" | "banner" | "category" | "logo"

interface PresetConfig {
  width: number
  height: number
  fit: "cover" | "contain" | "fill" | "inside" | "outside"
  maxBytes?: number
}

const PRESETS: Record<ImagePreset, PresetConfig> = {
  avatar: { width: 400, height: 400, fit: "cover", maxBytes: 2 * 1024 * 1024 }, // 2MB
  product: { width: 1200, height: 1200, fit: "inside" },
  banner: { width: 1920, height: 1080, fit: "inside" },
  category: { width: 800, height: 800, fit: "cover" },
  logo: { width: 600, height: 300, fit: "inside", maxBytes: 2 * 1024 * 1024 }, // 2MB
}

export class ImageOptimizer {
  private r2 = new CloudflareR2Provider()

  /**
   * Downloads an image from R2, validates size, processes via Sharp based on a preset,
   * uploads optimized variants (AVIF and WebP) back to R2, and deletes the original.
   * 
   * @param tempKey The temporary R2 key where the raw image was uploaded
   * @param presetName The configuration preset (e.g., 'avatar')
   * @returns Object containing the new AVIF and WebP keys and their URLs
   */
  async process(tempKey: string, presetName: ImagePreset) {
    const config = PRESETS[presetName]
    if (!config) throw new BadRequestError(`Invalid image preset: ${presetName}`)

    // 1. Download original from temporary upload path
    const buffer = await this.r2.download(tempKey)

    // 2. Validate size if applicable (fallback to server validation)
    if (config.maxBytes && buffer.length > config.maxBytes) {
      // Clean up the invalid file
      await this.r2.delete(tempKey).catch(() => {})
      throw new BadRequestError(`File exceeds maximum size for ${presetName} (${config.maxBytes / (1024 * 1024)}MB)`)
    }

    // 3. Process via Sharp (memory-efficient pipeline)
    const pipeline = sharp(buffer)
      .rotate() // Auto-orient via EXIF
      .resize(config.width, config.height, { fit: config.fit })

    // Generate both AVIF and WebP in parallel
    const [avifBuffer, webpBuffer] = await Promise.all([
      pipeline.clone().avif({ quality: 80, effort: 4 }).toBuffer(),
      pipeline.clone().webp({ quality: 80, effort: 4 }).toBuffer(),
    ])

    // 4. Generate new keys
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const baseKey = `optimized/${presetName}/${uniqueId}`
    const avifKey = `${baseKey}.avif`
    const webpKey = `${baseKey}.webp`

    // 5. Upload optimized variants
    const [avifResult, webpResult] = await Promise.all([
      this.r2.uploadBuffer(avifKey, "image/avif", avifBuffer),
      this.r2.uploadBuffer(webpKey, "image/webp", webpBuffer)
    ])

    // 6. Delete temporary upload to save space
    await this.r2.delete(tempKey).catch(() => {})

    return {
      avif: avifResult,
      webp: webpResult
    }
  }

  /**
   * Processes a raw image buffer via Sharp, uploads optimized variants (AVIF and WebP) to R2.
   * Useful for direct server uploads bypassing temporary R2 keys.
   */
  async processBuffer(buffer: Buffer, presetName: ImagePreset) {
    const config = PRESETS[presetName]
    if (!config) throw new BadRequestError(`Invalid image preset: ${presetName}`)

    // 1. Validate size if applicable
    if (config.maxBytes && buffer.length > config.maxBytes) {
      throw new BadRequestError(`File exceeds maximum size for ${presetName} (${config.maxBytes / (1024 * 1024)}MB)`)
    }

    // 2. Process via Sharp (memory-efficient pipeline)
    const pipeline = sharp(buffer)
      .rotate() // Auto-orient via EXIF
      .resize(config.width, config.height, { fit: config.fit })

    // Generate both AVIF and WebP in parallel
    const [avifBuffer, webpBuffer] = await Promise.all([
      pipeline.clone().avif({ quality: 80, effort: 4 }).toBuffer(),
      pipeline.clone().webp({ quality: 80, effort: 4 }).toBuffer(),
    ])

    // 3. Generate new keys
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const baseKey = `optimized/${presetName}/${uniqueId}`
    const avifKey = `${baseKey}.avif`
    const webpKey = `${baseKey}.webp`

    // 4. Upload optimized variants
    const [avifResult, webpResult] = await Promise.all([
      this.r2.uploadBuffer(avifKey, "image/avif", avifBuffer),
      this.r2.uploadBuffer(webpKey, "image/webp", webpBuffer)
    ])

    return {
      avif: avifResult,
      webp: webpResult
    }
  }

  /**
   * Deletes an optimized asset (AVIF and WebP) from R2 given its JSON string representation or object.
   */
  async deleteAsset(assetData: string | any) {
    try {
      let parsed: any;
      if (typeof assetData === "string") {
        if (!assetData.startsWith("{")) return; // not an optimized asset JSON
        parsed = JSON.parse(assetData);
      } else {
        parsed = assetData;
      }
      
      if (parsed?.avif?.key) {
        await this.r2.delete(parsed.avif.key).catch(() => {});
      }
      if (parsed?.webp?.key) {
        await this.r2.delete(parsed.webp.key).catch(() => {});
      }
    } catch (e) {
      // Ignore parsing errors or missing keys
    }
  }
}
