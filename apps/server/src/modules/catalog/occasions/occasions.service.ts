import { NotFoundError } from "@/core/errors/http-errors";
import db from "@/db"
import { occasion } from "@/db/schemas"
import { eq, desc } from "drizzle-orm"

export class OccasionsService {
  async listActiveOccasions() {
    return await db.query.occasion.findMany({
      where: eq(occasion.isActive, true),
      orderBy: [desc(occasion.createdAt)],
    })
  }

  async listAllOccasions(params?: any) {
    return await db.query.occasion.findMany({
      orderBy: [desc(occasion.createdAt)],
    })
  }

  async getOccasionBySlug(slug: string) {
    const result = await db.query.occasion.findFirst({
      where: eq(occasion.slug, slug),
    })
    if (!result) throw new NotFoundError("Occasion not found")
    return result
  }

  async create(data: any) {
    const [created] = await db.insert(occasion).values(data).returning()
    return created
  }

  async update(id: string, data: any) {
    const [updated] = await db
      .update(occasion)
      .set(data)
      .where(eq(occasion.id, id))
      .returning()
    if (!updated) throw new NotFoundError("Occasion not found")
    return updated
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(occasion)
      .where(eq(occasion.id, id))
      .returning()
    if (!deleted) throw new NotFoundError("Occasion not found")
    return deleted
  }
}
