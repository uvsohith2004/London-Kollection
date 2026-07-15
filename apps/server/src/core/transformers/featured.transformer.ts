import { transformProductList } from "./product.transformer"

export function transformFeaturedPiece(raw: any) {
  return transformProductList(raw.product)
}

export function transformFeaturedCollection(raw: any) {
  const col = raw.collection as any;
  if (col && col.image) {
    let rawUrl = col.image.url;
    if (col.image.asset) {
      rawUrl = col.image.asset.webp?.url || col.image.asset.avif?.url || rawUrl;
    }
    col.imageUrl = rawUrl && !rawUrl.startsWith("/api/media/view/") && !rawUrl.startsWith("http") ? `/api/media/view/${encodeURIComponent(rawUrl)}` : rawUrl;
  }
  return col;
}
