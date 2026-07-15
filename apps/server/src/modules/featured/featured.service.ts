import { NotFoundError } from "@/core/errors/http-errors";
import db from "@/db"
import { featuredPiece, featuredCollection } from "@/db/schemas"
import { eq, asc } from "drizzle-orm"
import { transformProductList } from "@/core/transformers/product.transformer"

export class FeaturedService {
  // Featured Pieces
  async getFeaturedPieces() {
    const items = await db.query.featuredPiece.findMany({
      where: eq(featuredPiece.isActive, true),
      orderBy: [asc(featuredPiece.sortOrder)],
      with: {
        product: {
          with: { images: true, variants: { with: { images: true } } }
        }
      }
    })
    return items
  }

  async getAllFeaturedPiecesForAdmin() {
    return await db.query.featuredPiece.findMany({
      orderBy: [asc(featuredPiece.sortOrder)],
      with: {
        product: {
          with: { images: true }
        }
      }
    })
  }

  async setFeaturedPieces(items: { productId: string, sortOrder: number }[]) {
    // Delete all existing
    await db.delete(featuredPiece);
    if (items.length > 0) {
      // Insert new
      await db.insert(featuredPiece).values(items.map(item => ({
        productId: item.productId,
        sortOrder: item.sortOrder,
        isActive: true
      })));
    }
  }

  async updateFeaturedPieceStatus(id: string, isActive: boolean) {
    const [result] = await db.update(featuredPiece)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(featuredPiece.id, id))
      .returning();
    if (!result) throw new NotFoundError("Featured piece not found")
    return result;
  }

  // Featured Collections
  async getFeaturedCollections() {
    const items = await db.query.featuredCollection.findMany({
      where: eq(featuredCollection.isActive, true),
      orderBy: [asc(featuredCollection.sortOrder)],
      with: {
        collection: true
      }
    })
    return items
  }

  async getAllFeaturedCollectionsForAdmin() {
    return await db.query.featuredCollection.findMany({
      orderBy: [asc(featuredCollection.sortOrder)],
      with: {
        collection: true
      }
    })
  }

  async setFeaturedCollections(items: { collectionId: string, sortOrder: number }[]) {
    await db.delete(featuredCollection);
    if (items.length > 0) {
      await db.insert(featuredCollection).values(items.map(item => ({
        collectionId: item.collectionId,
        sortOrder: item.sortOrder,
        isActive: true
      })));
    }
  }

  async updateFeaturedCollectionStatus(id: string, isActive: boolean) {
    const [result] = await db.update(featuredCollection)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(featuredCollection.id, id))
      .returning();
    if (!result) throw new NotFoundError("Featured collection not found")
    return result;
  }
}
