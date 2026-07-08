import db from "@/db"
import { category, product } from "@/db/schemas"
import { eq, desc, isNotNull, sql } from "drizzle-orm"

export class CategoriesService {
  async createCategory(data: any) {
    const [result] = await db.insert(category).values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      parentId: data.parentId || null,
      image: data.image || null,
      icon: data.icon || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: data.seoKeywords || null,
    }).returning()
    return result
  }

  async listCategories() {
    return await db.select().from(category)
  }

  async getCategoryById(id: string) {
    const [result] = await db.select().from(category).where(eq(category.id, id))
    return result || null
  }

  async updateCategory(id: string, data: any) {
    const [result] = await db
      .update(category)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(category.id, id))
      .returning()
    return result || null
  }

  async deleteCategory(id: string) {
    const [result] = await db.delete(category).where(eq(category.id, id)).returning()
    return result || null
  }

  async getRecentlyUpdatedCategories(limit = 3) {
    const recentProducts = await db.select({
      categoryId: product.categoryId,
      maxUpdatedAt: sql<Date>`MAX(${product.updatedAt})`.as('max_updated_at')
    })
    .from(product)
    .where(isNotNull(product.categoryId))
    .groupBy(product.categoryId)
    .orderBy(desc(sql`max_updated_at`))
    .limit(limit);

    if (recentProducts.length === 0) return [];

    const categoryIds = recentProducts.map(p => p.categoryId!);
    
    const categories = await db.query.category.findMany({
      where: (cat, { inArray }) => inArray(cat.id, categoryIds)
    });

    // Sort by recentProducts order
    return categoryIds.map(id => categories.find(c => c.id === id)).filter(Boolean);
  }
}
