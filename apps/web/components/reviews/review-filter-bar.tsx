import React, { useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface ReviewFilterBarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export function ReviewFilterBar({ currentFilter, onFilterChange, currentSort, onSortChange }: ReviewFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const filters = [
    { label: "All", value: "" },
    { label: "Positive", value: "positive" },
    { label: "Negative", value: "negative" },
    { label: "5 Stars", value: "5" },
    { label: "4 Stars", value: "4" },
    { label: "3 Stars", value: "3" },
    { label: "2 Stars", value: "2" },
    { label: "1 Star", value: "1" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-y border-border/30 my-8">
      
      {/* Filters (Native scrollable on mobile, wrapped on desktop) */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          "w-full md:w-auto md:flex-1 overflow-x-auto flex md:flex-wrap items-center gap-2 pb-2 md:pb-0",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
      >
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
              currentFilter === filter.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border/50 hover:border-border hover:bg-muted/50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>


      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sort By</span>
        <Select value={currentSort} onValueChange={(val) => onSortChange(val || "top")}>
          <SelectTrigger className="w-full md:w-45 rounded-full bg-background border-border/50 h-10 focus:ring-1 focus:ring-ring">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="top" className="rounded-lg">Top Rated</SelectItem>
            <SelectItem value="recent" className="rounded-lg">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
