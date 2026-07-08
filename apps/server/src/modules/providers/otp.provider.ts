import { logger } from "@/core/utils/logger"

export interface OTPProvider {
  sendOTP(phone: string): Promise<{ success: boolean; sessionId: string }>
  verifyOTP(sessionId: string, otp: string): Promise<boolean>
}

export class MockOTPProvider implements OTPProvider {
  private activeSessions = new Map<string, { phone: string; otp: string; expiresAt: number }>()

  async sendOTP(phone: string): Promise<{ success: boolean; sessionId: string }> {
    const sessionId = `otp_sess_${Math.random().toString(36).substring(7)}`
    // In Mock, OTP is always "123456" for convenience, but generated dynamically in debug logs.
    const otp = "123456"
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes expiration
    this.activeSessions.set(sessionId, { phone, otp, expiresAt })
    logger.debug(`[MockOTP] Sent OTP to phone ${phone}`, { sessionId })
    return { success: true, sessionId }
  }

  async verifyOTP(sessionId: string, otp: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId)
    if (!session) return false
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId)
      return false
    }
    if (session.otp === otp) {
      this.activeSessions.delete(sessionId)
      return true
    }
    return false
  }
}
