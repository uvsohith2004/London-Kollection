import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
}

export interface ReviewResponse {
  review: Review;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  voteScore: number;
  currentUserVote: number;
}

export const useProductReviews = (productId: string, filters: { rating?: string; sort?: string }) => {
  return useQuery({
    queryKey: ["reviews", productId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.sort) params.append("sort", filters.sort);
      
      const res = (await apiClient.get(`/reviews/product/${productId}?${params.toString()}`)) as any;
      return res.items as ReviewResponse[];
    },
  });
};

export const useProductRatingSummary = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId, "summary"],
    queryFn: async () => {
      const res = (await apiClient.get(`/reviews/product/${productId}/summary`)) as any;
      return res.summary;
    },
  });
};

export const useUserReviewStatus = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId, "me"],
    queryFn: async () => {
      // Might fail if not logged in, but we can catch it or rely on a wrapper
      try {
        const res = (await apiClient.get(`/reviews/product/${productId}/me`)) as any;
        return res.status as { eligible: boolean; hasReviewed: boolean; review: Review | null };
      } catch (e) {
        return { eligible: false, hasReviewed: false, review: null };
      }
    },
    retry: false, // Don't retry if it fails (e.g., 401 Unauthorized)
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; rating: number; title: string; comment: string }) => {
      const res = (await apiClient.post("/reviews", data)) as any;
      return res.review as Review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
    },
  });
};

export const useVoteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reviewId: string; vote: number }) => {
      await apiClient.post(`/reviews/${data.reviewId}/vote`, { vote: data.vote });
    },
  });
};
