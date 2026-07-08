import { useState, useRef } from "react";
import { OptimizedImage, OptimizedImageAsset } from "./optimized-image";
import { cn } from "@workspace/ui/lib/utils";

interface ImageMagnifierProps {
  src?: string;
  asset?: OptimizedImageAsset | string | null;
  fallbackUrl?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ImageMagnifier({ src, asset, fallbackUrl, alt, className, priority }: ImageMagnifierProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    // Calculate cursor position as percentage
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    // Ensure values are within bounds
    const boundedX = Math.min(Math.max(x, 0), 1);
    const boundedY = Math.min(Math.max(y, 0), 1);

    setPosition({ x: boundedX, y: boundedY });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
    setShowMagnifier(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full cursor-crosshair overflow-hidden group", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <OptimizedImage
        asset={asset || src}
        fallbackUrl={fallbackUrl || src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority={priority}
      />

      {showMagnifier && (
        <div
          className="absolute pointer-events-none z-10 rounded-full border border-border/50 bg-white shadow-xl overflow-hidden"
          style={{
            width: "250px",
            height: "250px",
            top: `${cursorPosition.y - 125}px`,
            left: `${cursorPosition.x - 125}px`,
            backgroundImage: `url(${typeof asset === 'object' ? asset?.avif?.url || asset?.webp?.url || fallbackUrl : asset || src})`,
            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
            // 200% scale for zoom effect
            backgroundSize: `${containerRef.current?.offsetWidth! * 2}px ${containerRef.current?.offsetHeight! * 2}px`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
}
