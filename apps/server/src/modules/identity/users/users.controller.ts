import { ok } from "@/core/response"
import { NotFoundError, BadRequestError } from "@/core/errors"
import { Context } from "hono"
import { UsersService } from "./users.service"
import { ImageOptimizer } from "../../media/optimizer/image.optimizer"

export class UsersController {
  private service = new UsersService()
  private imageOptimizer = new ImageOptimizer()

  async getProfile(c: Context) {
    const user = c.get("user")!
    const profile = await this.service.getProfile(user.id)
    return c.json(ok(profile))
  }

  async getAccounts(c: Context) {
    const user = c.get("user")!
    const accounts = await this.service.getConnectedAccounts(user.id)
    return c.json(ok(accounts))
  }

  async checkEmail(c: Context) {
    const email = c.req.query("email")
    if (!email) {
      throw new BadRequestError("Email is required")
    }
    const result = await this.service.checkEmailExists(email)
    return c.json(ok(result))
  }

  async resendVerification(c: Context) {
    const { email } = await c.req.valid("json" as never) as any
    const result = await this.service.checkEmailExists(email)
    
    if (!result.exists) {
      return c.json(ok({ message: "If your email is registered and unverified, an OTP has been sent." }))
    }
    
    if (result.verified) {
      throw new BadRequestError("Account is already verified. Please sign in.")
    }
    
    // Internal proxy to better-auth
    const port = process.env.PORT || 4000;
    const authRes = await fetch(`http://localhost:${port}/api/auth/email-otp/send-verification-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "email-verification" })
    });
    
    if (!authRes.ok) {
      throw new BadRequestError("Failed to send verification email. Please try again later.")
    }

    return c.json(ok({ message: "Verification email sent successfully." }))
  }

  async updateProfile(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const profile = await this.service.updateProfile(user.id, body)
    return c.json(ok(profile))
  }

  async processAvatar(c: Context) {
    const user = c.get("user")!
    const body = await c.req.parseBody()
    const file = body.file as any // Expecting a File instance from browser form

    if (!file || !file.name || !file.type || !file.type.startsWith("image/")) {
      throw new BadRequestError("Valid image file is required.")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process directly through optimizer
    const result = await this.imageOptimizer.processBuffer(buffer, "avatar")
    
    // Check for existing avatar to delete from storage
    const currentProfile = await this.service.getProfile(user.id)
    if (currentProfile?.avatar) {
      await this.imageOptimizer.deleteAsset(currentProfile.avatar)
    }

    // Store variants in the avatar field natively as JSONB
    const profile = await this.service.updateProfile(user.id, { avatar: result })
    
    return c.json(ok({ avatar: result, profile }))
  }

  async sendOtp(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const result = await this.service.sendPhoneOTP(user.id, body.phone)
    return c.json(ok(result))
  }

  async verifyOtp(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    await this.service.verifyPhoneOTP(user.id, body.sessionId, body.otp)
    return c.json(ok({ message: "Phone number verified successfully" }))
  }

  async listAdmin(c: Context) {
    const items = await this.service.listUsersForAdmin()
    return c.json(ok(items))
  }

  async updateRole(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const updated = await this.service.updateUserRoleByAdmin(id, body.role)
    if (!updated) {
      throw new NotFoundError("User not found")
    }
    return c.json(ok({ user: updated }))
  }
}
