"use client";

import * as React from "react";
import { MobileNavBar } from "./mobile-nav-bar";

interface MobilePagerProps {
  items: { name: string; icon: any; component: React.ReactNode }[];
}

export function MobilePager({ items }: MobilePagerProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const activeItem = items[selectedIndex];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 pt-8 px-4 relative">
        {activeItem?.component}
      </div>
      
      <MobileNavBar 
        items={items} 
        selectedIndex={selectedIndex} 
        onSelectIndex={setSelectedIndex}
      />
    </div>
  );
}
