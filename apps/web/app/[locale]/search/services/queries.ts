import { useQuery } from "@tanstack/react-query"
import { fetchSearchProducts, SearchParams } from "@/api-client/index"
import { apiClient } from "@/api-client/client"

import { Product } from "@/types/types"

const MOCK_PRODUCTS: any[] = [
  {
    id: "p1",
    title: "Midnight Silk Slip Dress",
    price: 120,
    discount: 0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: true,
    rating: 5,
    category: "fashion",
  },
  {
    id: "p2",
    title: "Oud Noir Extrait de Parfum",
    price: 350,
    discount: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1974&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: true,
    rating: 5,
    category: "fragrance",
  },
  {
    id: "p3",
    title: "Handcrafted Ceramic Vase",
    price: 85,
    discount: 0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: false,
    rating: 4,
    category: "home",
  },
  {
    id: "p4",
    title: "Cashmere Lounge Set",
    price: 210,
    discount: 0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: true,
    rating: 5,
    category: "fashion",
  },
  {
    id: "p5",
    title: "Structured Leather Tote",
    price: 450,
    discount: 0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: true,
    rating: 5,
    category: "accessories",
  },
  {
    id: "p6",
    title: "Abstract Gold Earrings",
    price: 150,
    discount: 120,
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1974&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: false,
    rating: 4,
    category: "accessories",
  },
  {
    id: "p7",
    title: "Linen Summer Blazer",
    price: 190,
    discount: 0,
    images: [
      {
        url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop",
        isPrimary: true,
      },
    ],
    isFeatured: true,
    rating: 5,
    category: "fashion",
  },
]

export function useSearchQuery(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: async () => {
      try {
        const data = await fetchSearchProducts(params)
        return data.items || []
      } catch (e) {
        // Fallback to local filtering of MOCK_PRODUCTS
        let results = [...MOCK_PRODUCTS]

        if (params.q) {
          const qLower = params.q.toLowerCase()
          results = results.filter((p) =>
            p.title.toLowerCase().includes(qLower)
          )
        }

        if (params.category) {
          const categories = params.category
            .split(",")
            .map((c) => c.trim().toLowerCase())
          results = results.filter(
            (p) => p.category && categories.includes(p.category)
          )
        }

        if (params.minPrice) {
          results = results.filter((p) => Number(p.price) >= params.minPrice!)
        }

        if (params.maxPrice) {
          results = results.filter((p) => Number(p.price) <= params.maxPrice!)
        }

        if (params.sort) {
          switch (params.sort) {
            case "price-asc":
              results.sort((a, b) => Number(a.price) - Number(b.price))
              break
            case "price-desc":
              results.sort((a, b) => Number(b.price) - Number(a.price))
              break
            case "newest":
              // Assuming newer items are at the end of the array, or we can just reverse
              results.reverse()
              break
          }
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        return results
      }
    },
    staleTime: 1 * 60 * 1000,
  })
}
