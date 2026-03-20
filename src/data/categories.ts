/**
 * Categories - Frontend Constants
 *
 * These are UI categories used for filtering and display
 * They are metadata about product classification, not products themselves
 *
 * Senior Pattern: Separate UI metadata from data storage
 * - Categories are configuration/metadata
 * - Products come from database
 */

export type Category = "Bangles" | "Necklaces" | "Earrings" | "Watches" | "Handbags";

export const categories: { name: Category; image: string; count: number }[] = [
  {
    name: "Bangles",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
    count: 24,
  },
  {
    name: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    count: 18,
  },
  {
    name: "Earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    count: 32,
  },
  {
    name: "Watches",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
    count: 15,
  },
  {
    name: "Handbags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    count: 20,
  },
];
