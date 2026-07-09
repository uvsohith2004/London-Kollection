"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getStoreSettings } from "@/lib/api";
import { cn } from "@workspace/ui/lib/utils";

interface LogoProps {
  className?: string;
  isMobile?: boolean;
}

export function Logo({ className, isMobile }: LogoProps) {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["store", "settings"],
    queryFn: getStoreSettings,
  });

  const logoUrl = settings?.logoUrl?.avif?.url || settings?.logoUrl?.url || settings?.logoUrl;
  const logoDarkUrl = settings?.logoDarkUrl?.avif?.url || settings?.logoDarkUrl?.url || settings?.logoDarkUrl;
  const siteName = settings?.siteName || "LK";
  
  // If we have both logos, we use CSS to toggle between them instantly based on the 'dark' class
  // on the html element. This prevents flash of wrong logo on hydration.
  const hasBothLogos = !!(logoUrl && logoDarkUrl);

  if (isLoading) {
    return (
      <Link 
        href="/" 
        className={cn(
          "shrink-0 font-heading text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-foreground/50 animate-pulse",
          className
        )}
      >
        LK.
      </Link>
    );
  }

  return (
    <Link 
      href="/" 
      className={cn("shrink-0 flex items-center", className)}
    >
      {hasBothLogos ? (
        <>
          <img 
            src={logoUrl} 
            alt={siteName} 
            className="h-8 md:h-10 w-auto object-contain dark:hidden"
          />
          <img 
            src={logoDarkUrl} 
            alt={siteName} 
            className="h-8 md:h-10 w-auto object-contain hidden dark:block"
          />
        </>
      ) : logoUrl ? (
        <img 
          src={logoUrl} 
          alt={siteName} 
          className="h-8 md:h-10 w-auto object-contain"
        />
      ) : (
        <span className="font-heading text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase text-foreground">
          {siteName === "London Kollection" ? "LK." : siteName + "."}
        </span>
      )}
    </Link>
  );
}
