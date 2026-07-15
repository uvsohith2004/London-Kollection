import { BadRequestError } from "@/core/errors"
import { CloudflareR2Provider } from "@/modules/providers"

export class MediaService {
  private provider = new CloudflareR2Provider()

  async uploadFile(file: { name: string; type: string; buffer: Buffer }, preset?: string) {
    // Validate file size and type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      throw new BadRequestError(`File type ${file.type} is not allowed.`)
    }

    if (preset) {
      const { ImageOptimizer } = await import("../optimizer/image.optimizer")
      const optimizer = new ImageOptimizer()
      return await optimizer.processBuffer(file.buffer, preset as any)
    }

    // Limit to 5MB
    const maxSize = 5 * 1024 * 1024
    if (file.buffer.length > maxSize) {
      throw new BadRequestError("File size exceeds 5MB limit.")
    }

    return await this.provider.upload(file)
  }

  async deleteFile(key: string) {
    return await this.provider.delete(key)
  }

  async generatePresignedUrl(key: string, expiresSeconds = 3600) {
    return await this.provider.generateSignedUrl(key, expiresSeconds)
  }

  async generatePresignedUploadUrl(filename: string, contentType: string) {
    const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, "_")}`
    const url = await this.provider.getPresignedUploadUrl(key, contentType)
    
    // We return both the URL to upload to, and the final key that the frontend 
    // will send to the backend to save the product.
    return { url, key }
  }

  async getRawPresignedUploadUrl(key: string, contentType: string) {
    const url = await this.provider.getPresignedUploadUrl(key, contentType)
    return { url, key }
  }
}
