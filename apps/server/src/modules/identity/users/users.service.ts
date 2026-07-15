import { NotFoundError, BadRequestError } from "@/core/errors"
import db from "@/db"
import { user } from "@/db/schemas"
import { eq, ilike, or } from "drizzle-orm"
import { MockOTPProvider } from "../../providers/otp.provider"

export class UsersService {
  private otpProvider = new MockOTPProvider()

  async getProfile(id: string) {
    const [result] = await db.select().from(user).where(eq(user.id, id))
    return result || null
  }

  async getConnectedAccounts(userId: string) {
    const { account } = await import("@/db/schemas")
    return await db.select().from(account).where(eq(account.userId, userId))
  }

  async checkEmailExists(email: string) {
    const [result] = await db.select().from(user).where(eq(user.email, email))
    if (!result) return { exists: false, verified: false }
    return { exists: true, verified: result.emailVerified }
  }

  async updateProfile(id: string, data: {
    name?: string
    avatar?: any
    phone?: string
    gender?: string
    dateOfBirth?: Date
  }) {
    const updateData: any = { ...data, updatedAt: new Date() }

    // If phone is updated, force phoneVerified to false until re-verified
    if (data.phone) {
      const current = await this.getProfile(id)
      if (current && current.phone !== data.phone) {
        updateData.phoneVerified = false
      }
    }

    const [updated] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning()
      
    if (!updated) throw new NotFoundError("User not found")
    return updated
  }

  async updateAvatar(userId: string, buffer: Buffer) {
    const { ImageOptimizer } = await import("../../media/optimizer/image.optimizer")
    const optimizer = new ImageOptimizer()
    const result = await optimizer.processBuffer(buffer, "avatar")
    
    const currentProfile = await this.getProfile(userId)
    if (currentProfile?.avatar) {
      await optimizer.deleteAsset(currentProfile.avatar)
    }

    const profile = await this.updateProfile(userId, { avatar: result })
    return { avatar: result, profile }
  }

  async sendPhoneOTP(id: string, phone: string) {
    // Basic verification: does user exist?
    const profile = await this.getProfile(id)
    if (!profile) {
      throw new NotFoundError("User profile not found")
    }

    // Call provider
    const { success, sessionId } = await this.otpProvider.sendOTP(phone)
    if (!success) {
      throw new BadRequestError("Failed to send OTP. Try again later.")
    }

    // Save temporary phone number to user context/state (or update phone in db, marked unverified)
    await db.update(user).set({ phone, phoneVerified: false }).where(eq(user.id, id))

    return { sessionId }
  }

  async verifyPhoneOTP(id: string, sessionId: string, otp: string) {
    const verified = await this.otpProvider.verifyOTP(sessionId, otp)
    if (!verified) {
      throw new BadRequestError("Invalid or expired OTP.")
    }

    // Mark as verified
    await db
      .update(user)
      .set({ phoneVerified: true, updatedAt: new Date() })
      .where(eq(user.id, id))

    return true
  }


  async listUsersForAdmin() {
    return await db.select().from(user)
  }

  async searchUsersForAdmin(query: string) {
    if (!query) return []
    const q = `%${query}%`
    return await db.select().from(user).where(
      or(
        ilike(user.name, q),
        ilike(user.email, q)
      )
    ).limit(20)
  }

  async updateUserRoleByAdmin(id: string, role: string) {
    const [updated] = await db
      .update(user)
      .set({ role: role as "user" | "admin", updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning()
      
    if (!updated) throw new NotFoundError("User not found")
    return updated
  }
}
