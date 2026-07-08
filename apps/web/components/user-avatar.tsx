"use client";

import { User } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { OptimizedImageAsset } from "./optimized-image";

interface UserAvatarProps {
  user?: {
    avatar?: OptimizedImageAsset | string | null;
    image?: string | null;
    name?: string | null;
  } | null;
  className?: string;
  iconClassName?: string;
}

export function UserAvatar({ user, className, iconClassName }: UserAvatarProps) {
  let avifUrl: string | null = null;
  let webpUrl: string | null = null;
  let standardUrl: string | null = null;

  // 1. Optimized avatar JSON
  if (user?.avatar) {
    if (typeof user.avatar === "object") {
      avifUrl = user.avatar.avif?.url || null;
      webpUrl = user.avatar.webp?.url || null;
    } else {
      standardUrl = user.avatar;
    }
  }

  // 2. Fallback to existing image field
  if (!avifUrl && !webpUrl && !standardUrl && user?.image) {
    standardUrl = user.image;
  }

  // 3. Render Optimized Picture
  if (avifUrl || webpUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center shrink-0 rounded-full", className)}>
        <picture className="w-full h-full object-cover">
          {avifUrl && <source srcSet={avifUrl} type="image/avif" />}
          {webpUrl && <img src={webpUrl} alt={user?.name || "User Avatar"} className="w-full h-full object-cover" />}
        </picture>
      </div>
    );
  }

  // 4. Render Standard Image
  if (standardUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center shrink-0 rounded-full", className)}>
        <img src={standardUrl} alt={user?.name || "User Avatar"} className="w-full h-full object-cover" />
      </div>
    );
  }

  // 5. Render Default Icon
  return (
    <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center shrink-0 rounded-full", className)}>
      <User className={cn("w-1/2 h-1/2 text-muted-foreground", iconClassName)} />
    </div>
  );
}
