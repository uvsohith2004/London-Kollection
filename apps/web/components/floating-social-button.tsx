"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

export function FloatingSocialButton() {
  const [bottomOffset, setBottomOffset] = useState(16); // Default 16px offset

  useEffect(() => {
    const updateOffset = () => {
      const bottomNav = document.getElementById("mobile-bottom-nav");
      if (bottomNav) {
        // Get the actual rendered height including safe-area
        const navHeight = bottomNav.getBoundingClientRect().height;
        setBottomOffset(navHeight + 16); // Add 16px spacing above the navbar
      } else {
        setBottomOffset(16);
      }
    };

    // Initial check
    updateOffset();

    // Setup ResizeObserver to watch for navbar changes
    const bottomNav = document.getElementById("mobile-bottom-nav");
    if (!bottomNav) return;

    const observer = new ResizeObserver(() => {
      updateOffset();
    });
    
    observer.observe(bottomNav);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Link
      href="https://tiktok.com/@londoncollection"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow us on TikTok"
      className={cn(
        "fixed right-4 z-[45]",
        "flex items-center justify-center w-11 h-11 rounded-full",
        "bg-foreground text-background shadow-md",
        "transition-transform duration-200 ease-out",
        "hover:scale-105 active:scale-95",
        "animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      )}
      style={{
        bottom: `${bottomOffset}px`,
        // Ensures padding respects iOS safe areas natively if applicable
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.77 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
      </svg>
    </Link>
  );
}
