"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@workspace/ui/lib/utils";
import { Home, ShoppingBag, Package, Users, Star, Settings, Activity } from "lucide-react";

const ITEMS = [
  { name: "Home", icon: Home },
  { name: "Orders", icon: ShoppingBag },
  { name: "Products", icon: Package },
  { name: "Users", icon: Users },
  { name: "Reviews", icon: Star },
  { name: "Settings", icon: Settings },
  { name: "Analytics", icon: Activity },
];

const ITEM_WIDTH = 68;

export default function SliceNavigation() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const currentIndex = useRef(selectedIndex);
  const drag = useRef({
    down: false,
    startPointer: 0,
    startX: 0,
    velocity: 0,
    lastPointer: 0,
    lastTime: performance.now(),
    isClick: true,
    clickedIndex: -1,
  });

  const getTargetX = (index: number) => -ITEM_WIDTH / 2 - index * ITEM_WIDTH;

  const snap = (index: number, animate = true) => {
    index = gsap.utils.clamp(0, ITEMS.length - 1, index);
    currentIndex.current = index;
    const targetX = getTargetX(index);

    if (animate) {
      gsap.to(trackRef.current, {
        x: targetX,
        duration: 0.6,
        ease: "elastic.out(1, 0.75)",
        onComplete: () => {
          setSelectedIndex(index);
        }
      });
    } else {
      gsap.set(trackRef.current, { x: targetX });
      setSelectedIndex(index);
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    gsap.set(track, { x: getTargetX(currentIndex.current) });

    const render = () => {
      const x = Number(gsap.getProperty(track, "x"));
      const progress = (-x - ITEM_WIDTH / 2) / ITEM_WIDTH;

      itemsRef.current.forEach((item, i) => {
        if (!item) return;

        const d = Math.abs(progress - i);
        const t = gsap.utils.clamp(0, 1, d / 1.5);
        
        const scale = gsap.utils.interpolate(1.25, 0.8, t);
        const y = gsap.utils.interpolate(-12, 0, t);
        
        gsap.set(item, { y });

        const outerRing = item.querySelector('.nav-outer-ring') as HTMLElement;
        const innerCircle = item.querySelector('.nav-inner-circle') as HTMLElement;
        const icon = item.querySelector('.nav-icon') as HTMLElement;

        if (outerRing) {
          gsap.set(outerRing, {
            opacity: 1 - t,
            scale: gsap.utils.interpolate(1, 0.8, t),
          });
        }

        if (innerCircle) {
          gsap.set(innerCircle, { scale });
          innerCircle.style.backgroundColor = t < 0.5 ? 'hsl(var(--background))' : 'rgba(255, 255, 255, 0.05)';
          innerCircle.style.boxShadow = t < 0.5 ? '0px 8px 16px rgba(0,0,0,0.15)' : 'none';
        }
        
        if (icon) {
           icon.style.color = t < 0.5 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))';
        }
      });
    };

    gsap.ticker.add(render);
    render();

    const down = (e: PointerEvent) => {
      gsap.killTweensOf(track);
      drag.current.down = true;
      drag.current.isClick = true;
      drag.current.startPointer = e.clientX;
      drag.current.startX = Number(gsap.getProperty(track, "x"));
      drag.current.lastPointer = e.clientX;
      drag.current.lastTime = performance.now();
      viewport.setPointerCapture(e.pointerId);

      const target = e.target as HTMLElement;
      const itemEl = target.closest('[data-index]');
      drag.current.clickedIndex = itemEl ? parseInt(itemEl.getAttribute('data-index') || '-1', 10) : -1;
    };

    const move = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const dx = e.clientX - drag.current.startPointer;
      
      if (Math.abs(dx) > 5) drag.current.isClick = false;

      let nextX = drag.current.startX + dx;
      const maxX = getTargetX(0);
      const minX = getTargetX(ITEMS.length - 1);
      
      if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.3;
      if (nextX < minX) nextX = minX + (nextX - minX) * 0.3;

      const now = performance.now();
      const dt = now - drag.current.lastTime;
      if (dt > 0) {
        drag.current.velocity = (e.clientX - drag.current.lastPointer) / dt;
      }
      drag.current.lastPointer = e.clientX;
      drag.current.lastTime = now;

      gsap.set(track, { x: nextX });
    };

    const up = () => {
      if (!drag.current.down) return;
      drag.current.down = false;

      if (drag.current.isClick && drag.current.clickedIndex !== -1) {
        snap(drag.current.clickedIndex, true);
        return;
      }

      const currentX = Number(gsap.getProperty(track, "x"));
      const throwDistance = gsap.utils.clamp(-ITEM_WIDTH * 1.5, ITEM_WIDTH * 1.5, drag.current.velocity * 200);
      const projected = currentX + throwDistance;

      let targetIndex = Math.round((-projected - ITEM_WIDTH / 2) / ITEM_WIDTH);
      snap(targetIndex, true);
    };

    viewport.addEventListener("pointerdown", down);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", up);
    viewport.addEventListener("pointercancel", up);

    return () => {
      gsap.ticker.remove(render);
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", up);
      viewport.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex w-full flex-col overflow-hidden bg-zinc-950">
      <style>{`
        body, html {
          overflow: hidden !important;
        }
      `}</style>
      {/* Visual Debugging Viewport above the navbar */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
         <h1 className="text-2xl font-bold text-white mb-2">Testing Route</h1>
         <p className="text-zinc-400">Current selection: <span className="text-white font-bold">{ITEMS[selectedIndex]?.name}</span></p>
         
         <div className="mt-8 p-12 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col items-center gap-4">
             <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
                 {ITEMS[selectedIndex] && React.createElement(ITEMS[selectedIndex].icon, { className: "w-8 h-8 text-white" })}
             </div>
             <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">{ITEMS[selectedIndex]?.name}</p>
         </div>
      </div>
      
      {/* The redesigned Navbar */}
      <div className="pb-safe relative w-full z-50 h-24 bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800 overflow-hidden select-none touch-none" ref={viewportRef}>
        <div className="absolute left-1/2 top-0 h-full w-0 flex items-center">
          <div ref={trackRef} className="flex h-full items-center will-change-transform">
            {ITEMS.map((item, idx) => (
              <div
                key={item.name}
                data-index={idx}
                ref={(el) => { itemsRef.current[idx] = el; }}
                className="relative flex shrink-0 items-center justify-center cursor-pointer touch-none"
                style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}
              >
                {/* Outer Ring */}
                <div className="nav-outer-ring absolute inset-1 rounded-full border-[2px] border-white/20 opacity-0 transition-none" />
                
                {/* Inner Circle */}
                <div className="nav-inner-circle absolute inset-3 flex items-center justify-center rounded-full bg-white/5 transition-none">
                  <item.icon className="nav-icon h-5 w-5 text-zinc-500 transition-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
