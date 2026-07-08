import { ok } from "@/core/response"
import { BadRequestError } from "@/core/errors"
import { Context } from "hono"
import { MediaService } from "./media.service"

export class MediaController {
  private service = new MediaService()

  async upload(c: Context) {
    const body = await c.req.parseBody()
    const file = body.file as any // Expecting a File instance from browser form
    const preset = body.preset as string

    if (!file || !file.name || !file.type) {
      throw new BadRequestError("No valid file uploaded.")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (preset) {
      const { ImageOptimizer } = await import("../optimizer/image.optimizer")
      const optimizer = new ImageOptimizer()
      const result = await optimizer.processBuffer(buffer, preset as any)
      return c.json(ok(result))
    }

    const result = await this.service.uploadFile({
      name: file.name,
      type: file.type,
      buffer,
    })

    return c.json(ok(result))
  }

  async uploadAvatar(c: Context) {
    const user = c.get("user")!
    const body = await c.req.parseBody()
    const file = body.file as any // Expecting a File instance from browser form

    if (!file || !file.name || !file.type || !file.type.startsWith("image/")) {
      throw new BadRequestError("Valid image file is required.")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await this.service.uploadFile({
      name: `avatars/${user.id}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
      type: file.type,
      buffer,
    })

    return c.json(ok(result))
  }

  async getPresignedUploadUrl(c: Context) {
    const filename = c.req.query("filename")
    const contentType = c.req.query("contentType")
    
    if (!filename || !contentType) {
      throw new BadRequestError("filename and contentType are required")
    }

    const result = await this.service.generatePresignedUploadUrl(filename, contentType)
    return c.json(ok(result))
  }

  async getAvatarPresignedUploadUrl(c: Context) {
    const user = c.get("user")!
    const contentType = c.req.query("contentType")

    if (!contentType || !contentType.startsWith("image/")) {
      throw new BadRequestError("Valid image contentType is required")
    }

    const key = `temp-avatars/${user.id}-${Date.now()}`
    const result = await this.service.getRawPresignedUploadUrl(key, contentType)
    return c.json(ok(result))
  }

  async viewImage(c: Context) {
    const key = c.req.param("key")
    if (!key) {
      throw new BadRequestError("File key is required")
    }

    // Generate a temporary signed GET URL and redirect the browser to it
    const url = await this.service.generatePresignedUrl(key, 3600)
    return c.redirect(url, 302)
  }

  async getPresignedUrl(c: Context) {
    const key = c.req.query("key")
    if (!key) {
      throw new BadRequestError("File key is required")
    }

    const url = await this.service.generatePresignedUrl(key)
    return c.json(ok({ url }))
  }
}
