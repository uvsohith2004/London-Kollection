import { createAuthClient } from "better-auth/react"
import { twoFactorClient, emailOTPClient, adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth` : "http://localhost:4000/api/auth",
    plugins: [
        twoFactorClient(),
        emailOTPClient(),
        adminClient()
    ]
})
