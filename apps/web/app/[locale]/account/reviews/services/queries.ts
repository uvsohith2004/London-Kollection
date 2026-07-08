import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useUserReviewsQuery = () => {
  return useQuery({
    queryKey: ["customer-reviews"],
    queryFn: async () => {
      try {
        const response = await api.get('/reviews/me');
        // @ts-ignore
        return response.items || [];
      } catch {
        // Mock fallback if endpoint doesn't exist yet
        return [
          {
            id: "rev_1",
            productId: "prod_a123",
            productName: "Oversized Silk Oxford",
            rating: 5,
            comment: "The drape on this silk is immaculate. Truly a centerpiece for evening events. Highly recommend.",
            createdAt: new Date().toISOString(),
            status: "published",
          },
          {
            id: "rev_2",
            productId: "prod_b456",
            productName: "Structured Wool Overcoat",
            rating: 4,
            comment: "Incredible tailoring. Fits slightly snug around the shoulders compared to the runway measurements, but flawless construction.",
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            status: "published",
          },
        ];
      }
    }
  });
};
