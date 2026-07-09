import { getConfig } from "@/config"
import { logger } from "@/core/utils/logger"
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export interface MediaProvider {
  upload(file: {
    name: string
    type: string
    buffer: Buffer
  }): Promise<{ url: string; size: number; key: string }>
  delete(key: string): Promise<void>
  generateSignedUrl(key: string, expiresSeconds?: number): Promise<string>
  getPresignedUploadUrl(key: string, type: string): Promise<string>
  download(key: string): Promise<Buffer>
  uploadBuffer(key: string, type: string, buffer: Buffer): Promise<{ url: string; size: number; key: string }>
}

export class CloudflareR2Provider implements MediaProvider {
  private _client: S3Client | null = null
  private _bucketName: string | null = null

  private getBucketName(): string {
    if (this._bucketName) return this._bucketName
    const config = getConfig()
    this._bucketName = config.r2.bucketName || "default-bucket"
    return this._bucketName
  }

  private getClient(): S3Client {
    if (this._client) return this._client
    
    const config = getConfig()
    const accountId = config.r2.accountId
    const accessKeyId = config.r2.accessKeyId
    const secretAccessKey = config.r2.secretAccessKey
    
    this._client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
      forcePathStyle: true,
    })
    
    return this._client
  }

  constructor() {}

  // Direct server upload
  async upload(file: {
    name: string
    type: string
    buffer: Buffer
  }): Promise<{ url: string; size: number; key: string }> {
    const key = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`
    
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
        Body: file.buffer,
        ContentType: file.type,
      })
    )

    // For a private bucket, "url" is just an internal reference
    const url = `/api/media/view/${encodeURIComponent(key)}`
    
    return { url, size: file.buffer.length, key }
  }

  async uploadBuffer(key: string, type: string, buffer: Buffer): Promise<{ url: string; size: number; key: string }> {
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: type,
      })
    )

    const url = `/api/media/view/${encodeURIComponent(key)}`
    return { url, size: buffer.length, key }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.getClient().send(
        new DeleteObjectCommand({
          Bucket: this.getBucketName(),
          Key: key,
        })
      )
      logger.debug(`[R2] Deleted file with key: ${key}`)
    } catch (error) {
      logger.error(`[R2] Error deleting file ${key}`, error)
      throw error
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const response = await this.getClient().send(
        new GetObjectCommand({
          Bucket: this.getBucketName(),
          Key: key,
        })
      )
      if (!response.Body) {
        throw new Error("No body returned from R2")
      }
      const stream = response.Body as NodeJS.ReadableStream
      const chunks: Buffer[] = []
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
      }
      return Buffer.concat(chunks)
    } catch (error) {
      logger.error(`[R2] Error downloading file ${key}`, error)
      throw error
    }
  }

  // Generate signed GET URL for downloading/viewing private files
  async generateSignedUrl(
    key: string,
    expiresSeconds: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    })
    
    return await getSignedUrl(this.getClient(), command, { expiresIn: expiresSeconds })
  }

  // Generate signed PUT URL for frontend direct upload
  async getPresignedUploadUrl(key: string, type: string, expiresSeconds: number = 600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
      ContentType: type,
    })

    return await getSignedUrl(this.getClient(), command, { expiresIn: expiresSeconds })
  }
}
