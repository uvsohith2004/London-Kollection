import db from "@/db"
import { collection } from "@/db/schemas"
import { eq } from "drizzle-orm"

export class CollectionsService {
  async createCollection(data: any) {
    const [result] = await db.insert(collection).values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: data.seoKeywords || null,
    }).returning()
    return result
  }

  async listCollections() {
    return await db.select().from(collection)
  }

  async getCollectionById(id: string) {
    const [result] = await db.select().from(collection).where(eq(collection.id, id))
    return result || null
  }

  async updateCollection(id: string, data: any) {
    console.log("updateCollection: ",data)
    const existing = await this.getCollectionById(id)
    if(!existing){
      return null
    }
    const [result] = await db
      .update(collection)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(collection.id, id))
      .returning()
    return result || null
  }

  async deleteCollection(id: string) {
    const [result] = await db.delete(collection).where(eq(collection.id, id)).returning()
    return result || null
  }
}
