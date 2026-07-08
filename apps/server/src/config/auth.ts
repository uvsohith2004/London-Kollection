import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { twoFactor, admin, emailOTP } from "better-auth/plugins"
import "dotenv/config"
import db from "../db"
import { EmailFactory } from "../modules/services/email/email.factory"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000", "http://localhost:4000"],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      disableImplicitLinking: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      avatar: { type: "string", required: false },
      phone: { type: "string", required: false },
      gender: { type: "string", required: false },
      dateOfBirth: { type: "date", required: false },
      phoneVerified: { type: "boolean", defaultValue: false },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await EmailFactory.sendEmail({
            to: user.email,
            subject: "Your London Kollection Login Code",
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="font-weight: 300;">London Kollection Authentication</h2>
                <p>Your one-time password is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
              </div>
            `,
          })
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, request) {
        let subject = "Verify your email - London Kollection";
        let message = "Your email verification code is:";
        
        if (type === "forget-password") {
          subject = "Reset your password - London Kollection";
          message = "Your password reset code is:";
        }
        
        await EmailFactory.sendEmail({
          to: email,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="font-weight: 300;">London Kollection Authentication</h2>
              <p>${message}</p>
              <h1 style="font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>This code will expire in 5 minutes.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
            </div>
          `,
        })
      },
    }),
  ],
})
