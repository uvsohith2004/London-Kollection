import { BadRequestError } from "@/core/errors"
import { z } from "zod"
import "dotenv/config"
import { logger } from "@/core/utils/logger"

export const ConfigSchema = z.object({
  database: z.object({
    url: z.string().url("DATABASE_URL must be a valid URL"),
  }),
  r2: z.object({
    accountId: z.string().min(1, "R2_ACCOUNT_ID is required"),
    accessKeyId: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
    secretAccessKey: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
    bucketName: z.string().min(1, "R2_BUCKET_NAME is required"),
    publicUrl: z.string().url("R2_PUBLIC_URL must be a valid URL").optional(),
  }),
  shipping: z.object({
    shipmentApiKey: z.string().optional(),
  }),
  email: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.coerce.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    resendApiKey: z.string().optional(),
    sesRegion: z.string().optional(),
    sesAccessKeyId: z.string().optional(),
    sesSecretAccessKey: z.string().optional(),
    fromName: z.string().default("London Kollection"),
    fromAddress: z.string().default("noreply@londonkollection.com"),
  }),
  sms: z.object({
    providerApiKey: z.string().optional(),
  }),
  oauth: z.object({
    googleClientId: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    googleClientSecret: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  }),
  betterAuth: z.object({
    secret: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    url: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  }),
})

export type Config = z.infer<typeof ConfigSchema>

let config: Config

export async function loadConfig(): Promise<Config> {
  if (config) return config

  const rawConfig = {
    database: {
      url: process.env.DATABASE_URL,
    },
    r2: {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL || undefined,
    },
    shipping: {
      shipmentApiKey: process.env.SHIPMENT_API_KEY,
    },
    email: {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      resendApiKey: process.env.RESEND_API_KEY,
      sesRegion: process.env.AWS_REGION,
      sesAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      sesSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      fromName: process.env.EMAIL_FROM_NAME,
      fromAddress: process.env.EMAIL_FROM_ADDRESS,
    },
    sms: {
      providerApiKey: process.env.SMS_PROVIDER_API_KEY,
    },
    oauth: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    betterAuth: {
      secret: process.env.BETTER_AUTH_SECRET,
      url: process.env.BETTER_AUTH_URL,
    },
  }

  // Validate the schema
  try {
    const parsed = ConfigSchema.parse(rawConfig)
    config = deepFreeze(parsed)
  } catch (error) {
    logger.error("Configuration validation failed on startup:", { error })
    throw new Error(`Configuration validation failed: ${(error as any).message}`)
  }

  return config
}

export async function reloadConfig(): Promise<Config> {
  // @ts-ignore
  config = undefined
  return await loadConfig()
}

function deepFreeze(obj: any): any {
  if (obj && typeof obj === "object") {
    Object.freeze(obj)
    Object.keys(obj).forEach((key) => {
      deepFreeze(obj[key])
    })
  }
  return obj
}

// Helper to get loaded config synchronously (must call loadConfig() on startup first)
export function getConfig(): Config {
  if (!config) {
    throw new BadRequestError("Config has not been loaded yet. Call loadConfig() first.")
  }
  return config
}
