import db from "@/db"
import { address } from "@/db/schemas"
import { eq, and } from "drizzle-orm"

export class AddressesService {
  async createAddress(userId: string, data: {
    name: string
    phone: string
    country: string
    state: string
    city: string
    postalCode: string
    landmark?: string
    addressLine1: string
    addressLine2?: string
    type?: string
    default?: boolean
  }) {
    return await db.transaction(async (tx) => {
      // If this address is set to default, unset other defaults of the same type for this user
      const isDefault = data.default ?? false
      const addrType = data.type || "shipping"

      if (isDefault) {
        await tx
          .update(address)
          .set({ default: false, updatedAt: new Date() })
          .where(and(eq(address.userId, userId), eq(address.type, addrType)))
      }

      const [newAddr] = await tx
        .insert(address)
        .values({
          userId,
          name: data.name,
          phone: data.phone,
          country: data.country,
          state: data.state,
          city: data.city,
          postalCode: data.postalCode,
          landmark: data.landmark || null,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          type: addrType,
          default: isDefault,
        })
        .returning()

      return newAddr
    })
  }

  async listAddresses(userId: string) {
    return await db.select().from(address).where(eq(address.userId, userId))
  }

  async getAddressById(id: string, userId: string) {
    const [result] = await db
      .select()
      .from(address)
      .where(and(eq(address.id, id), eq(address.userId, userId)))
    return result || null
  }

  async updateAddress(id: string, userId: string, data: any) {
    return await db.transaction(async (tx) => {
      const isDefault = data.default
      const addrType = data.type || "shipping"

      if (isDefault) {
        await tx
          .update(address)
          .set({ default: false, updatedAt: new Date() })
          .where(and(eq(address.userId, userId), eq(address.type, addrType)))
      }

      const [updated] = await tx
        .update(address)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(and(eq(address.id, id), eq(address.userId, userId)))
        .returning()

      return updated || null
    })
  }

  async deleteAddress(id: string, userId: string) {
    const [deleted] = await db
      .delete(address)
      .where(and(eq(address.id, id), eq(address.userId, userId)))
      .returning()
    return deleted || null
  }

  async setDefaultAddress(id: string, userId: string, type: string) {
    return await db.transaction(async (tx) => {
      await tx
        .update(address)
        .set({ default: false, updatedAt: new Date() })
        .where(and(eq(address.userId, userId), eq(address.type, type)))

      const [updated] = await tx
        .update(address)
        .set({ default: true, updatedAt: new Date() })
        .where(and(eq(address.id, id), eq(address.userId, userId)))
        .returning()

      return updated || null
    })
  }
}
