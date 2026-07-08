import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
})

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const SendOTPSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
})

export const VerifyOTPSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  otp: z.string().min(1, "OTP is required"),
})

export const UpdateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
})

export const ProcessAvatarSchema = z.object({
  key: z.string().min(1, "Upload key is required"),
})
