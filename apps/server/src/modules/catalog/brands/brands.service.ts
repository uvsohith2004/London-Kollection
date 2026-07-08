import db from "@/db"
import { brand } from "@/db/schemas"
import { eq, ilike, or } from "drizzle-orm"
import { generateSlug } from "../../../core/utils/slug"
import { BadRequestError, NotFoundError } from "@/core/errors"

export class BrandsService {
  async getAllBrands(search?: string) {
    if (search) {
      return await db.query.brand.findMany({
        where: or(
          ilike(brand.name, `%${search}%`),
          ilike(brand.slug, `%${search}%`)
        ),
        orderBy: (brand, { desc }) => [desc(brand.createdAt)]
      })
    }
    return await db.query.brand.findMany({
      orderBy: (brand, { desc }) => [desc(brand.createdAt)]
    })
  }

  async getBrandById(id: string) {
    const item = await db.query.brand.findFirst({
      where: eq(brand.id, id),
    })
    if (!item) throw new NotFoundError("Brand not found")
    return item
  }

  async createBrand(data: any) {
    const slug = data.slug || generateSlug(data.name)

    const existing = await db.query.brand.findFirst({
      where: eq(brand.slug, slug),
    })
    if (existing) throw new BadRequestError("Brand slug already in use")

    const [newBrand] = await db
      .insert(brand)
      .values({
        name: data.name,
        slug,
        website: data.website || null,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      })
      .returning()

    return newBrand
  }

  async updateBrand(id: string, data: any) {
    await this.getBrandById(id)

    if (data.slug) {
      const existing = await db.query.brand.findFirst({
        where: eq(brand.slug, data.slug),
      })
      if (existing && existing.id !== id) {
        throw new BadRequestError("Brand slug already in use")
      }
    }

    const [updatedBrand] = await db
      .update(brand)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(brand.id, id))
      .returning()

    return updatedBrand
  }

  async deleteBrand(id: string) {
    await this.getBrandById(id)
    await db.delete(brand).where(eq(brand.id, id))
    return { success: true }
  }
}
