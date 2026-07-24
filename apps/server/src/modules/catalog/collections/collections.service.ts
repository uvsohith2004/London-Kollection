import { NotFoundError } from "@/core/errors/http-errors"
import db from "@/db"
import { collection } from "@/db/schemas"
import { eq } from "drizzle-orm"

export class CollectionsService {
  async createCollection(data: any) {
    const [result] = await db
      .insert(collection)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      })
      .returning()
    return result
  }

  async listCollections() {
    return await db.select().from(collection)
  }

  async getCollectionById(id: string) {
    const [result] = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id))
    if (!result) throw new NotFoundError("Collection not found")
    return result
  }

  async getCollectionBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(collection)
      .where(eq(collection.slug, slug))
    if (!result) throw new NotFoundError("Collection not found")
    return result
  }

  async updateCollection(id: string, data: any) {
    console.log("updateCollection: ", data)
    const existing = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id))
    if (!existing.length) {
      throw new NotFoundError("Collection not found")
    }
    const [result] = await db
      .update(collection)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(collection.id, id))
      .returning()
    return result
  }

  async deleteCollection(id: string) {
    const [result] = await db
      .delete(collection)
      .where(eq(collection.id, id))
      .returning()
    if (!result) throw new NotFoundError("Collection not found")
    return result
  }
}
