import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { MediaController } from "./media.controller"

export const mediaRouter = new Hono<AppEnv>()
const controller = new MediaController()

mediaRouter.post("/upload", requireRole("admin"), (c) => controller.upload(c))
mediaRouter.post("/upload/avatar", requireAuth, (c) => controller.uploadAvatar(c))
mediaRouter.get("/upload-url", requireRole("admin"), (c) => controller.getPresignedUploadUrl(c))
mediaRouter.get("/upload-url/avatar", requireAuth, (c) => controller.getAvatarPresignedUploadUrl(c))
mediaRouter.get("/presign", requireAuth, (c) => controller.getPresignedUrl(c))

// Public or semi-public endpoint (redirects to temporary signed R2 URL)
// Note: In production you might want to cache this or use a CDN
mediaRouter.get("/view/:key{.+$}", (c) => controller.viewImage(c))
