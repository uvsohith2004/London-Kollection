"use server"

import { serverApi } from "@/api/server"
import { revalidatePath } from "next/cache"

export async function inviteAdmin(userId: string) {
  try {
    await serverApi.patch(`/admin/users/${userId}/role`, { role: "admin" })
    revalidatePath("/admin/settings/team")
    return { success: true }
  } catch (error) {
    console.error("Failed to update admin user role:", error)
    return { error: "Failed to update user role." }
  }
}
