import { NotFoundError } from "@/core/errors/http-errors";
import db from "@/db"
import { heroCarousel, product, orderItem } from "@/db/schemas"
import { eq, and, or, isNull, isNotNull, lte, gte, desc, sql, inArray, notInArray } from "drizzle-orm"
import { transformProductList } from "@/core/transformers/product.transformer"

export class HeroService {
  async addSlide(data: {
    image: any
    title?: string
    description?: string
    buttonText?: string
    linkUrl?: string
    published?: boolean
    sortOrder?: number
    scheduleStart?: Date
    scheduleEnd?: Date
  }) {
    const [result] = await db
      .insert(heroCarousel)
      .values({
        image: data.image,
        title: data.title || null,
        description: data.description || null,
        buttonText: data.buttonText || null,
        linkUrl: data.linkUrl || null,
        published: data.published ?? false,
        sortOrder: data.sortOrder ?? 0,
        scheduleStart: data.scheduleStart || null,
        scheduleEnd: data.scheduleEnd || null,
      })
      .returning()
    return result
  }

  async getActiveSlides() {
    const now = new Date()

    const slides = await db.query.heroCarousel.findMany({
      where: and(
        eq(heroCarousel.published, true),
        or(isNull(heroCarousel.scheduleStart), lte(heroCarousel.scheduleStart, now)),
        or(isNull(heroCarousel.scheduleEnd), gte(heroCarousel.scheduleEnd, now))
      ),
      orderBy: (hero, { asc }) => [asc(hero.sortOrder)],
    })
    
    return slides
  }

  async listAllSlidesForAdmin() {
    const slides = await db.query.heroCarousel.findMany({
      orderBy: (hero, { asc }) => [asc(hero.sortOrder)],
    })
    return slides
  }

  async updateSlide(id: string, data: any) {
    const [result] = await db
      .update(heroCarousel)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(heroCarousel.id, id))
      .returning()
    if (!result) throw new NotFoundError("Slide not found")
    return result
  }

  async removeSlide(id: string) {
    const [result] = await db.delete(heroCarousel).where(eq(heroCarousel.id, id)).returning()
    if (!result) throw new NotFoundError("Slide not found")
    return result
  }

  async reorderSlides(orderList: { id: string; sortOrder: number }[]) {
    return await db.transaction(async (tx) => {
      const results = []
      for (const item of orderList) {
        const [updated] = await tx
          .update(heroCarousel)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(heroCarousel.id, item.id))
          .returning()
        results.push(updated)
      }
      return results
    })
  }


}
