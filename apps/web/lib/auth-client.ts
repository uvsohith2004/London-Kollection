import { createAuthClient } from "better-auth/react"
import { twoFactorClient, emailOTPClient, adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth` : "http://localhost:3000/api/auth",
    plugins: [
        twoFactorClient(),
        emailOTPClient(),
        adminClient()
    ]
})
