import { NotFoundError, ConflictError } from "@/core/errors/http-errors"
import db from "@/db"
import {
  product,
  productImage,
  productCategory,
  productCollection,
  productOption,
  productOptionValue,
  productVariant,
  productOccasion,
  orderItem,
  order,
  userProductHistory,
  userSearchHistory,
  category,
} from "@/db/schemas"
import { userHeatmap } from "@/db/schemas/heatmap.schema"
import { nanoid } from "nanoid"
import {
  eq,
  and,
  or,
  gte,
  lte,
  desc,
  sql,
  notInArray,
  isNotNull,
  isNull,
  ilike,
  inArray,
} from "drizzle-orm"
import { HeatmapService } from "../../heatmap/heatmap.service"
import {
  RawProductData,
  CreateProductDTO,
  UpdateProductDTO,
} from "./product.dto"
import { cache, CacheKeys } from "@/cache"

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
const isValidUUID = (id: string | null | undefined) =>
  id ? uuidRegex.test(id) : false

export class ProductsService {
  async createProduct(data: CreateProductDTO) {
    const existingSlug = await db.query.product.findFirst({
      where: eq(product.slug, data.slug),
    })
    if (existingSlug) {
      throw new ConflictError(
        "A product with this slug already exists. Please use a different slug."
      )
    }

    if (data.variants && data.variants.length > 0) {
      const skus = data.variants.map((v) => v.sku).filter(Boolean)
      if (skus.length > 0) {
        const existingVariant = await db.query.productVariant.findFirst({
          where: inArray(productVariant.sku, skus),
        })
        if (existingVariant) {
          throw new ConflictError(
            `SKU ${existingVariant.sku} already exists. Please use a unique SKU.`
          )
        }
      }
    }

    return await db.transaction(async (tx) => {
      const [insertedProduct] = await tx
        .insert(product)
        .values({
          title: data.title,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          visibility: data.visibility || "public",
          status: data.status || "draft",
          price: data.price,
          discount: data.discount || "0.00",
          currency: data.currency || "KWD",
          brandId: isValidUUID(data.brandId) ? data.brandId : null,
          productType: data.productType || null,
          categoryId: data.categoryId || null,
          taxClassId: data.taxClassId || null,

          returnFormId: isValidUUID(data.returnFormId)
            ? data.returnFormId
            : null,
          returnWindowDays: data.returnWindowDays ?? 14,
          published: data.published ?? false,
          featured: data.featured ?? false,
          isNewArrival: data.isNewArrival ?? false,
          isReturnable: data.isReturnable ?? true,
          isExchangeable: data.isExchangeable ?? true,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          seoKeywords: data.seoKeywords || null,
          dimensions: data.dimensions || null,
        })
        .returning()

      const productId = insertedProduct.id

      // Insert categories
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.insert(productCategory).values(
          data.categoryIds.map((categoryId) => ({
            productId,
            categoryId,
          }))
        )
      }

      // Insert collections
      if (data.collectionIds && data.collectionIds.length > 0) {
        await tx.insert(productCollection).values(
          data.collectionIds.map((collectionId) => ({
            productId,
            collectionId,
          }))
        )
      }

      // Insert occasions
      if (data.occasionIds && data.occasionIds.length > 0) {
        await tx.insert(productOccasion).values(
          data.occasionIds.map((occasionId) => ({
            productId,
            occasionId,
          }))
        )
      }

      // Insert options and their values
      if (data.options && data.options.length > 0) {
        for (const opt of data.options) {
          const [insertedOption] = await tx
            .insert(productOption)
            .values({
              productId,
              name: opt.name,
              position: opt.position ?? 0,
            })
            .returning()

          if (opt.values && opt.values.length > 0) {
            await tx.insert(productOptionValue).values(
              opt.values.map((val) => ({
                optionId: insertedOption.id,
                value: val,
              }))
            )
          }
        }
      }

      // Insert variants
      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          const [insertedVariant] = await tx
            .insert(productVariant)
            .values({
              productId,
              name: v.name || null,
              sku: v.sku,
              isDefault: v.isDefault ?? false,
              price: v.price || null,
              discountValue: v.discountValue || "0.00",
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock,
              combinations: v.combinations,
              barcode: v.barcode || null,
              inventoryStatus: v.inventoryStatus || "in_stock",
            })
            .returning()

          if (v.images && v.images.length > 0) {
            await tx.insert(productImage).values(
              v.images.map((img: any) => ({
                id: img.id || nanoid(),
                productId: productId,
                variantId: insertedVariant.id,
                asset: img.asset || { webp: { key: img.url, url: img.url } },
                alt: img.alt || null,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder || 0,
              }))
            )
          }
        }
      }

      // Invalidate relevant caches
      await cache.invalidatePattern("products:trending:*")
      await cache.invalidatePattern("products:newArrivals:*")
      await cache.invalidatePattern("products:search:*")

      return insertedProduct
    })
  }

  async getProductById(id: string) {
    const prod = await cache.getOrSet(
      CacheKeys.product(id),
      async () => {
        const prod = await db.query.product.findFirst({
          where: eq(product.id, id),
          with: {
            images: true,
            brand: true,
            taxClass: true,
            categories: { with: { category: true } },
            collections: { with: { collection: true } },
            occasions: { with: { occasion: true } },
            options: { with: { values: true } },
            variants: { with: { images: true } },
          },
        })
        return prod
      },
      86400 // 24 hours
    )
    if (!prod) throw new NotFoundError("Product not found")
    return prod
  }

  async getProductBySlug(slug: string) {
    const prod = await db.query.product.findFirst({
      where: and(eq(product.slug, slug), eq(product.archived, false)),
      with: {
        images: true,
        brand: true,
        taxClass: true,
        categories: { with: { category: true } },
        collections: { with: { collection: true } },
        occasions: { with: { occasion: true } },
        options: { with: { values: true } },
        variants: { with: { images: true } },
      },
    })
    if (!prod) throw new NotFoundError("Product not found")
    return prod
  }

  async listProducts(filters: {
    published?: boolean
    featured?: boolean
    newArrivals?: boolean
    collectionId?: string
    categoryId?: string
    limit?: number
    offset?: number
  }) {
    // Hash filters for a unique cache key
    const hash = Buffer.from(JSON.stringify(filters)).toString("base64")

    return await cache.getOrSet(
      CacheKeys.productSearch(hash),
      async () => {
        const limit = filters.limit || 20
        const offset = filters.offset || 0

        const conditions = [eq(product.archived, false)]
        if (filters.published !== undefined) {
          conditions.push(eq(product.published, filters.published))
        }
        if (filters.featured !== undefined) {
          conditions.push(eq(product.featured, filters.featured))
        }
        if (filters.newArrivals) {
          conditions.push(eq(product.isNewArrival, true))
        }

        const orderBys = []
        if (filters.newArrivals) {
          orderBys.push(desc(product.createdAt))
        }

        const results = await db.query.product.findMany({
          where: and(...conditions),
          limit,
          offset,
          orderBy: orderBys,
          with: {
            images: true,
            variants: { with: { images: true } },
          },
        })

        return results
      },
      900 // 15 minutes
    )
  }

  async searchProducts(filters: {
    categorySlug?: string
    collectionId?: string
    q?: string
    minPrice?: number
    maxPrice?: number
    isBranded?: string
    limit?: number
    offset?: number
  }) {
    const limit = filters.limit || 20
    const offset = filters.offset || 0

    const conditions = [
      eq(product.archived, false),
      eq(product.published, true),
    ]

    if (filters.q) {
      conditions.push(ilike(product.title, `%${filters.q}%`))
    }

    if (filters.isBranded === "true") {
      conditions.push(isNotNull(product.brandId))
    } else if (filters.isBranded === "false") {
      conditions.push(isNull(product.brandId))
    }

    let productIds: string[] | null = null

    if (filters.categorySlug) {
      const [cat] = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.slug, filters.categorySlug))
      if (!cat) return []

      const pc = await db
        .select({ productId: productCategory.productId })
        .from(productCategory)
        .where(eq(productCategory.categoryId, cat.id))
      const ids = pc
        .map((p) => p.productId)
        .filter((id) => id !== null) as string[]

      const directMatches = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.categoryId, cat.id))
      const directIds = directMatches.map((p) => p.id)

      const allIds = Array.from(new Set([...ids, ...directIds]))
      if (allIds.length === 0) return []
      productIds = allIds
    }

    if (filters.collectionId) {
      const pc = await db
        .select({ productId: productCollection.productId })
        .from(productCollection)
        .where(eq(productCollection.collectionId, filters.collectionId))
      const ids = pc
        .map((p) => p.productId)
        .filter((id) => id !== null) as string[]

      if (ids.length === 0) return []

      if (productIds !== null) {
        productIds = productIds.filter((id) => ids.includes(id))
        if (productIds.length === 0) return []
      } else {
        productIds = ids
      }
    }

    if (productIds !== null) {
      conditions.push(inArray(product.id, productIds))
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(product.price, filters.minPrice.toString()))
    }
    
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(product.price, filters.maxPrice.toString()))
    }

    const results = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: [desc(product.createdAt)],
      with: {
        images: true,
        variants: { with: { images: true } },
        categories: { with: { category: true } },
      },
    })

    return results
  }

  async getAdminProducts(filters: {
    q?: string
    limit?: number
    offset?: number
  }) {
    const limit = filters.limit || 50
    const offset = filters.offset || 0

    const conditions = [eq(product.archived, false)]

    if (filters.q) {
      conditions.push(ilike(product.title, `%${filters.q}%`))
    }

    const results = await db.query.product.findMany({
      where: and(...conditions),
      limit,
      offset,
      orderBy: [desc(product.createdAt)],
      with: {
        images: true,
        brand: true,
        taxClass: true,
        options: { with: { values: true } },
        variants: { with: { images: true } },
        categories: { with: { category: true } },
        collections: { with: { collection: true } },
        occasions: { with: { occasion: true } },
      },
    })

    return results
  }

  async getFeaturedProducts(limit = 8) {
    const results = await db.query.product.findMany({
      where: and(eq(product.published, true), eq(product.featured, true)),
      limit,
      orderBy: [desc(product.updatedAt)],
      with: {
        images: true,
        variants: { with: { images: true } },
      },
    })
    return results
  }

  async getTrendingProducts(limit = 10) {
    return await cache.getOrSet(
      CacheKeys.trending(limit),
      async () => {
        const topOrdered = await db
          .select({
            productId: orderItem.productId,
            totalQuantity: sql`sum(${orderItem.quantity})`.mapWith(Number),
          })
          .from(orderItem)
          .where(isNotNull(orderItem.productId))
          .groupBy(orderItem.productId)
          .orderBy(desc(sql`sum(${orderItem.quantity})`.mapWith(Number)))
          .limit(limit)

        const orderedProductIds = topOrdered
          .map((item) => item.productId)
          .filter((id): id is string => id !== null)

        let trendingProducts: any[] = []

        if (orderedProductIds.length > 0) {
          const orderedResults = await db.query.product.findMany({
            where: and(
              eq(product.published, true),
              inArray(product.id, orderedProductIds)
            ),
            with: {
              images: true,
              variants: { with: { images: true } },
            },
          })

          trendingProducts = orderedProductIds
            .map((id) => orderedResults.find((p) => p.id === id))
            .filter(Boolean)
        }

        if (trendingProducts.length < limit) {
          const remainingLimit = limit - trendingProducts.length
          const excludeIds = trendingProducts.map((p) => p.id)

          const conditions = [eq(product.published, true)]
          if (excludeIds.length > 0) {
            conditions.push(notInArray(product.id, excludeIds))
          }

          const recentProducts = await db.query.product.findMany({
            where: and(...conditions),
            limit: remainingLimit,
            orderBy: [desc(product.updatedAt)],
            with: {
              images: true,
              variants: { with: { images: true } },
            },
          })

          trendingProducts = [...trendingProducts, ...recentProducts]
        }

        return trendingProducts
      },
      3600 // 1 hour
    )
  }

  async getNewArrivals(limit = 10) {
    return await cache.getOrSet(
      CacheKeys.newArrivals(limit),
      async () => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const results = await db.query.product.findMany({
          where: and(
            eq(product.published, true),
            eq(product.archived, false),
            or(
              eq(product.isNewArrival, true), // Forced new arrival
              gte(product.createdAt, thirtyDaysAgo) // Automatic 30 days rule
            )
          ),
          limit,
          orderBy: [desc(product.createdAt)],
          with: {
            images: true,
            variants: { with: { images: true } },
          },
        })
        return results
      },
      3600 // 1 hour
    )
  }

  async getPersonalizedRecommendations(userId: string | null, limit = 8) {
    if (!userId) {
      return this.getFeaturedProducts(limit)
    }

    const heatmapService = new HeatmapService()
    let map = await heatmapService.getHeatmap(userId)

    const latestView = await db.query.userProductHistory.findFirst({
      where: eq(userProductHistory.userId, userId),
      orderBy: [desc(userProductHistory.lastViewedAt)],
    })

    const latestSearch = await db.query.userSearchHistory.findFirst({
      where: eq(userSearchHistory.userId, userId),
      orderBy: [desc(userSearchHistory.lastSearchedAt)],
    })

    let needsUpdate = false
    if (!map) needsUpdate = true
    else if (latestView && latestView.lastViewedAt > map.lastCalculatedAt)
      needsUpdate = true
    else if (latestSearch && latestSearch.lastSearchedAt > map.lastCalculatedAt)
      needsUpdate = true

    if (needsUpdate) {
      const generated = await heatmapService.calculateHeatmap(userId)
      map = {
        userId,
        categoryScores: generated.categoryScores,
        collectionScores: generated.collectionScores,
        occasionScores: generated.occasionScores,
        lastCalculatedAt: new Date(),
      } as any
    }

    const categoryScores = (map?.categoryScores as Record<string, number>) || {}
    const collectionScores =
      (map?.collectionScores as Record<string, number>) || {}
    const occasionScores = (map?.occasionScores as Record<string, number>) || {}

    if (
      Object.keys(categoryScores).length === 0 &&
      Object.keys(collectionScores).length === 0 &&
      Object.keys(occasionScores).length === 0
    ) {
      return this.getFeaturedProducts(limit)
    }

    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 5)
    const topCollections = Object.entries(collectionScores)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 5)
    const topOccasions = Object.entries(occasionScores)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 5)

    const categoryMatches =
      topCategories.length > 0
        ? await db
            .select({
              id: productCategory.productId,
              categoryId: productCategory.categoryId,
            })
            .from(productCategory)
            .where(inArray(productCategory.categoryId, topCategories))
        : []
    const collectionMatches =
      topCollections.length > 0
        ? await db
            .select({
              id: productCollection.productId,
              collectionId: productCollection.collectionId,
            })
            .from(productCollection)
            .where(inArray(productCollection.collectionId, topCollections))
        : []
    const occasionMatches =
      topOccasions.length > 0
        ? await db
            .select({
              id: productOccasion.productId,
              occasionId: productOccasion.occasionId,
            })
            .from(productOccasion)
            .where(inArray(productOccasion.occasionId, topOccasions))
        : []
    const directCategoryMatches =
      topCategories.length > 0
        ? await db
            .select({ id: product.id, categoryId: product.categoryId })
            .from(product)
            .where(inArray(product.categoryId, topCategories))
        : []

    const candidateScores = new Map<string, number>()

    for (const m of occasionMatches) {
      const affinity = occasionScores[m.occasionId] || 1
      candidateScores.set(m.id, (candidateScores.get(m.id) || 0) + affinity * 3)
    }
    for (const m of collectionMatches) {
      const affinity = collectionScores[m.collectionId] || 1
      candidateScores.set(m.id, (candidateScores.get(m.id) || 0) + affinity * 2)
    }
    for (const m of categoryMatches) {
      const affinity = categoryScores[m.categoryId] || 1
      candidateScores.set(m.id, (candidateScores.get(m.id) || 0) + affinity * 1)
    }
    for (const m of directCategoryMatches) {
      if (m.categoryId) {
        const affinity = categoryScores[m.categoryId] || 1
        candidateScores.set(
          m.id,
          (candidateScores.get(m.id) || 0) + affinity * 1
        )
      }
    }

    // Exclude previously ordered items
    const userOrders = await db
      .select({ productId: orderItem.productId })
      .from(orderItem)
      .leftJoin(order, eq(orderItem.orderId, order.id))
      .where(and(eq(order.userId, userId), isNotNull(orderItem.productId)))

    const orderedProductIds = userOrders
      .map((o) => o.productId)
      .filter((id): id is string => id !== null)
    orderedProductIds.forEach((id) => candidateScores.delete(id))

    const sortedCandidateIds = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, limit)

    let recommendedProducts: any[] = []
    if (sortedCandidateIds.length > 0) {
      const related = await db.query.product.findMany({
        where: and(
          eq(product.published, true),
          eq(product.archived, false),
          inArray(product.id, sortedCandidateIds)
        ),
        with: { images: true, variants: { with: { images: true } } },
      })
      recommendedProducts = sortedCandidateIds
        .map((id) => related.find((p) => p.id === id))
        .filter(Boolean)
    }

    if (recommendedProducts.length < limit) {
      const remainingLimit = limit - recommendedProducts.length
      const excludeIds = [
        ...orderedProductIds,
        ...recommendedProducts.map((p) => p.id),
      ]
      const conditions = [
        eq(product.published, true),
        eq(product.archived, false),
        eq(product.featured, true),
      ]
      if (excludeIds.length > 0)
        conditions.push(notInArray(product.id, excludeIds))

      const fillProducts = await db.query.product.findMany({
        where: and(...conditions),
        limit: remainingLimit,
        orderBy: [desc(product.updatedAt)],
        with: { images: true, variants: { with: { images: true } } },
      })
      recommendedProducts = [...recommendedProducts, ...fillProducts]
    }

    return recommendedProducts
  }

  async getRelatedProducts(productId: string, limit = 4) {
    const current = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: {
        categories: true,
        collections: true,
        occasions: true,
      },
    })

    if (!current) return []

    const categoryIds = current.categories.map((c) => c.categoryId)
    const collectionIds = current.collections.map((c) => c.collectionId)
    const occasionIds = current.occasions.map((c) => c.occasionId)
    if (current.categoryId && !categoryIds.includes(current.categoryId)) {
      categoryIds.push(current.categoryId)
    }

    const categoryMatches =
      categoryIds.length > 0
        ? await db
            .select({ id: productCategory.productId })
            .from(productCategory)
            .where(inArray(productCategory.categoryId, categoryIds))
        : []
    const collectionMatches =
      collectionIds.length > 0
        ? await db
            .select({ id: productCollection.productId })
            .from(productCollection)
            .where(inArray(productCollection.collectionId, collectionIds))
        : []
    const occasionMatches =
      occasionIds.length > 0
        ? await db
            .select({ id: productOccasion.productId })
            .from(productOccasion)
            .where(inArray(productOccasion.occasionId, occasionIds))
        : []

    const scores = new Map<string, number>()

    for (const match of occasionMatches) {
      scores.set(match.id, (scores.get(match.id) || 0) + 3)
    }
    for (const match of collectionMatches) {
      scores.set(match.id, (scores.get(match.id) || 0) + 2)
    }
    for (const match of categoryMatches) {
      scores.set(match.id, (scores.get(match.id) || 0) + 1)
    }

    scores.delete(productId)

    const sortedProductIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, limit)

    if (sortedProductIds.length === 0) return []

    const related = await db.query.product.findMany({
      where: and(
        eq(product.published, true),
        eq(product.archived, false),
        inArray(product.id, sortedProductIds)
      ),
      with: {
        images: true,
        variants: { with: { images: true } },
      },
    })

    const orderedRelated = sortedProductIds
      .map((id) => related.find((p) => p.id === id))
      .filter(Boolean)

    return orderedRelated
  }

  async getSuggestions(productId: string, limit = 10) {
    const current = await db.query.product.findFirst({
      where: eq(product.id, productId),
      with: {
        categories: true,
        brand: true,
      },
    })

    if (!current) return { sameBrand: [], otherBrands: [] }

    const categoryIds = current.categories.map((c) => c.categoryId)
    if (current.categoryId && !categoryIds.includes(current.categoryId)) {
      categoryIds.push(current.categoryId)
    }

    let sameBrand: any[] = []

    // First try to find products from the exact same brand
    if (current.brandId) {
      sameBrand = await db.query.product.findMany({
        where: and(
          eq(product.published, true),
          eq(product.archived, false),
          eq(product.brandId, current.brandId)
        ),
        limit,
        orderBy: [desc(product.createdAt)],
        with: { images: true, variants: { with: { images: true } } },
      })
    }

    // If no brand products (or only the current product), fallback to same category
    if (sameBrand.length <= 1) {
      if (categoryIds.length > 0) {
        const catMatches = await db
          .select({ id: productCategory.productId })
          .from(productCategory)
          .where(inArray(productCategory.categoryId, categoryIds))

        const matchedIds = catMatches.map((m) => m.id)

        const catConditions = []
        if (matchedIds.length > 0)
          catConditions.push(inArray(product.id, matchedIds))
        catConditions.push(inArray(product.categoryId, categoryIds))

        sameBrand = await db.query.product.findMany({
          where: and(
            eq(product.published, true),
            eq(product.archived, false),
            or(...catConditions)
          ),
          limit,
          orderBy: [desc(product.createdAt)],
          with: { images: true, variants: { with: { images: true } } },
        })
      } else {
        // Ultimate fallback: just get latest products
        sameBrand = await db.query.product.findMany({
          where: and(eq(product.published, true), eq(product.archived, false)),
          limit,
          orderBy: [desc(product.createdAt)],
          with: { images: true, variants: { with: { images: true } } },
        })
      }
    }

    // You May Also Like (Other Brands/Products)
    let otherBrands = await db.query.product.findMany({
      where: and(
        eq(product.published, true),
        eq(product.archived, false),
        current.brandId
          ? sql`${product.brandId} IS NULL OR ${product.brandId} != ${current.brandId}`
          : undefined
      ),
      limit: limit * 2, // Fetch extra so we can filter duplicates in memory
      orderBy: [desc(product.createdAt)],
      with: { images: true, variants: { with: { images: true } } },
    })

    // Fallback if still empty
    if (otherBrands.length === 0) {
      otherBrands = await db.query.product.findMany({
        where: and(eq(product.published, true), eq(product.archived, false)),
        limit,
        orderBy: [desc(product.createdAt)],
        with: { images: true, variants: { with: { images: true } } },
      })
    }

    // Deduplicate between arrays so the same product doesn't appear in both lists
    const sameBrandIds = new Set(sameBrand.map((p) => p.id))
    otherBrands = otherBrands
      .filter((p) => !sameBrandIds.has(p.id))
      .slice(0, limit)

    return {
      sameBrand,
      otherBrands,
    }
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    return await db.transaction(async (tx) => {
      const {
        categoryIds,
        collectionIds,
        occasionIds,
        images,
        options,
        variants,
        ...baseData
      } = data

      // Clean up UUID fields that might be empty strings or invalid mocked values
      baseData.brandId = isValidUUID(baseData.brandId) ? baseData.brandId : null
      baseData.categoryId = isValidUUID(baseData.categoryId)
        ? baseData.categoryId
        : null
      baseData.taxClassId = isValidUUID(baseData.taxClassId)
        ? baseData.taxClassId
        : null

      baseData.returnFormId = isValidUUID(baseData.returnFormId)
        ? baseData.returnFormId
        : null
      if (baseData.returnWindowDays === undefined)
        delete baseData.returnWindowDays

      // Map SEO fields
      const updateValues: Record<string, any> = {
        ...baseData,
        updatedAt: new Date(),
      }

      const [updated] = await tx
        .update(product)
        .set(updateValues)
        .where(eq(product.id, id))
        .returning()

      if (!updated) throw new NotFoundError("Product not found")

      // If categories provided, replace
      if (categoryIds) {
        await tx
          .delete(productCategory)
          .where(eq(productCategory.productId, id))
        if (categoryIds.length > 0) {
          await tx.insert(productCategory).values(
            categoryIds.map((categoryId: string) => ({
              productId: id,
              categoryId,
            }))
          )
        }
      }

      // If collections provided, replace
      if (collectionIds) {
        await tx
          .delete(productCollection)
          .where(eq(productCollection.productId, id))
        if (collectionIds.length > 0) {
          await tx.insert(productCollection).values(
            collectionIds.map((collectionId: string) => ({
              productId: id,
              collectionId,
            }))
          )
        }
      }

      // If occasions provided, replace
      if (occasionIds) {
        await tx
          .delete(productOccasion)
          .where(eq(productOccasion.productId, id))
        if (occasionIds.length > 0) {
          await tx.insert(productOccasion).values(
            occasionIds.map((occasionId: string) => ({
              productId: id,
              occasionId,
            }))
          )
        }
      }

      // Clear out any base-level images since we now enforce variant-only images
      await tx
        .delete(productImage)
        .where(
          and(
            eq(productImage.productId, id),
            sql`${productImage.variantId} IS NULL`
          )
        )

      // If options provided, replace
      if (options) {
        await tx.delete(productOption).where(eq(productOption.productId, id))
        if (options.length > 0) {
          for (const opt of options) {
            const [insertedOption] = await tx
              .insert(productOption)
              .values({
                productId: id,
                name: opt.name,
                position: opt.position ?? 0,
              })
              .returning()

            if (opt.values && opt.values.length > 0) {
              await tx.insert(productOptionValue).values(
                opt.values.map((val: string) => ({
                  optionId: insertedOption.id,
                  value: val,
                }))
              )
            }
          }
        }
      }

      // If variants provided, replace
      if (variants) {
        // Delete existing variant images and variants
        await tx
          .delete(productImage)
          .where(
            and(
              eq(productImage.productId, id),
              sql`${productImage.variantId} IS NOT NULL`
            )
          )
        await tx.delete(productVariant).where(eq(productVariant.productId, id))

        if (variants.length > 0) {
          for (const v of variants) {
            const [insertedVariant] = await tx
              .insert(productVariant)
              .values({
                productId: id,
                sku: v.sku,
                isDefault: v.isDefault ?? false,
                price: v.price || null,
                discountValue: v.discountValue || "0.00",
                compareAtPrice: v.compareAtPrice || null,
                stock: v.stock,
                combinations: v.combinations,
                barcode: v.barcode || null,
                inventoryStatus: v.inventoryStatus || "in_stock",
              })
              .returning()

            if (v.images && v.images.length > 0) {
              await tx.insert(productImage).values(
                v.images.map((img: any) => ({
                  id: img.id || nanoid(),
                  productId: id,
                  variantId: insertedVariant.id,
                  asset: img.asset || { webp: { key: img.url, url: img.url } },
                  alt: img.alt || null,
                  isPrimary: img.isPrimary || false,
                  sortOrder: img.sortOrder || 0,
                }))
              )
            }
          }
        }
      }

      // Invalidate specific product and lists
      await cache.delete(CacheKeys.product(id))
      await cache.invalidatePattern("products:trending:*")
      await cache.invalidatePattern("products:newArrivals:*")
      await cache.invalidatePattern("products:search:*")

      return updated
    })
  }

  async archiveProduct(id: string) {
    const [result] = await db
      .delete(product)
      .where(eq(product.id, id))
      .returning()

    if (result) {
      // Invalidate caches
      await cache.delete(CacheKeys.product(id))
      await cache.invalidatePattern("products:trending:*")
      await cache.invalidatePattern("products:newArrivals:*")
      await cache.invalidatePattern("products:search:*")
      return result
    }

    throw new NotFoundError("Product not found")
  }
}
