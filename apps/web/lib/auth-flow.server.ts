"use server"

import { cookies } from "next/headers"

export type AuthFlowStep = "verify_otp" | "reset_password" | "verify_email"

/**
 * Sets a temporary HttpOnly cookie to enforce sequential authentication flows.
 * This prevents users from skipping steps or navigating directly to verification pages.
 */
export async function setAuthFlowState(step: AuthFlowStep) {
  const cookieStore = await cookies()
  cookieStore.set("lk_flow_state", step, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 minutes to complete the flow
    path: "/",
    sameSite: "lax"
  })
}

/**
 * Clears the authentication flow state upon successful completion or cancellation.
 */
export async function clearAuthFlowState() {
  const cookieStore = await cookies()
  cookieStore.delete("lk_flow_state")
}
