import { useEffect } from "react";
import gsap from "gsap";

export function useSubtleEntrance(
  ref: React.RefObject<HTMLElement | null>,
  options = { stagger: 0.05, duration: 0.4, yOffset: 15, delay: 0 }
) {
  useEffect(() => {
    if (!ref.current) return;

    // Check if we should skip animations (e.g., user prefers reduced motion)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const elements = ref.current.querySelectorAll('.animate-item');
    
    // If no specific animate-item class, animate the container itself
    if (elements.length === 0) {
      gsap.fromTo(
        ref.current,
        { y: options.yOffset, opacity: 0 },
        { y: 0, opacity: 1, duration: options.duration, delay: options.delay, ease: "power2.out" }
      );
      return;
    }

    // Stagger animate the children
    gsap.fromTo(
      elements,
      { y: options.yOffset, opacity: 0 },
      { y: 0, opacity: 1, stagger: options.stagger, duration: options.duration, delay: options.delay, ease: "power2.out" }
    );
  }, [ref, options.stagger, options.duration, options.yOffset, options.delay]);
}
