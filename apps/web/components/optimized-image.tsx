import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"

export type OptimizedImageAsset = {
  avif?: {
    key: string
    url: string
    sizeBytes?: number
  }
  webp?: {
    key: string
    url: string
    sizeBytes?: number
  }
  width?: number
  height?: number
}

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, "src"> {
  asset?: OptimizedImageAsset | string | null
  fallbackUrl?: string
}

export function OptimizedImage({ asset, fallbackUrl, className, alt, ...props }: OptimizedImageProps) {
  // If asset is a legacy string URL, just render it normally
  if (typeof asset === "string") {
    let cleanUrl = asset;
    if (asset.startsWith("/api/image?key=")) {
      cleanUrl = asset.replace("/api/image?key=", "");
    }
    return (
      <Image
        src={cleanUrl}
        alt={alt || "Image"}
        className={cn("object-cover", className)}
        {...props}
      />
    )
  }

  // If asset is an optimized object, prioritize AVIF, fallback to WebP
  const src = asset?.avif?.url || asset?.webp?.url || fallbackUrl

  if (!src) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", className)}>
        <span className="text-muted-foreground text-xs">No image</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt || "Image"}
      className={cn("object-cover", className)}
      unoptimized={true}
      {...props}
    />
  )
}
