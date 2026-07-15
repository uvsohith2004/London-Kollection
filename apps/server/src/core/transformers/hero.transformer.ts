import type { HeroCarousel } from "@workspace/api-contracts"

export function transformHeroCarousel(raw: any): HeroCarousel {
  if (!raw || !raw.image) return raw as HeroCarousel;
  let rawUrl = typeof raw.image === 'string' ? raw.image : (raw.image.webp?.url || raw.image.avif?.url || raw.image.url);
  if (rawUrl && !rawUrl.startsWith("/api/media/view/") && !rawUrl.startsWith("http")) {
    rawUrl = `/api/media/view/${encodeURIComponent(rawUrl)}`;
  }
  
  return {
    ...raw,
    image: typeof raw.image === 'object' ? { ...raw.image, url: rawUrl } : rawUrl
  } as HeroCarousel
}

export function transformHeroCarouselList(raw: any): HeroCarousel {
  return transformHeroCarousel(raw)
}
