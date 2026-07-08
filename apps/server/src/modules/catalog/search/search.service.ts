import db from "@/db"
import { product, productCategory, productCollection } from "@/db/schemas"
import { eq, and, lte, gte, or, ilike, desc, asc, sql } from "drizzle-orm"

export interface SearchFilters {
  q?: string
  categoryId?: string
  collectionId?: string
  minPrice?: string
  maxPrice?: string
  featured?: boolean
  discount?: boolean
  sortBy?: "newest" | "price_asc" | "price_desc" | "popularity" | "discount"
  limit?: number
  page?: number
}

export class SearchService {
  async search(filters: SearchFilters) {
    const limit = filters.limit || 20
    const page = filters.page || 1
    const offset = (page - 1) * limit

    const conditions = [eq(product.archived, false), eq(product.published, true)]

    // Search query (ilike on title, description)
    if (filters.q) {
      conditions.push(
        or(
          ilike(product.title, `%${filters.q}%`),
          ilike(product.description || "", `%${filters.q}%`)
        )!
      )
    }

    // Featured
    if (filters.featured !== undefined) {
      conditions.push(eq(product.featured, filters.featured))
    }

    // Discount (greater than 0)
    if (filters.discount) {
      conditions.push(sql`${product.discount} > 0`)
    }

    // Price range
    if (filters.minPrice) {
      conditions.push(gte(product.price, filters.minPrice))
    }
    if (filters.maxPrice) {
      conditions.push(lte(product.price, filters.maxPrice))
    }

    // Category filter
    if (filters.categoryId) {
      const subQuery = db
        .select({ productId: productCategory.productId })
        .from(productCategory)
        .where(eq(productCategory.categoryId, filters.categoryId))
      conditions.push(sql`${product.id} IN ${subQuery}`)
    }

    // Collection filter
    if (filters.collectionId) {
      const subQuery = db
        .select({ productId: productCollection.productId })
        .from(productCollection)
        .where(eq(productCollection.collectionId, filters.collectionId))
      conditions.push(sql`${product.id} IN ${subQuery}`)
    }

    // Sorting
    let orderByExpression: any = desc(product.createdAt)
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          orderByExpression = desc(product.createdAt)
          break
        case "price_asc":
          orderByExpression = asc(product.price)
          break
        case "price_desc":
          orderByExpression = desc(product.price)
          break
        case "discount":
          orderByExpression = desc(product.discount)
          break
        // popularity can fall back to rating or default to createdAt
        case "popularity":
        default:
          orderByExpression = desc(product.createdAt)
          break
      }
    }

    const items = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: orderByExpression,
      with: {
        images: true,
        variants: true,
      },
    })

    // Count total matches
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(product)
      .where(and(...conditions))
    const total = Number(totalResult[0]?.count || 0)

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
