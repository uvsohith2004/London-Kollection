import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

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
      return res.items ?? [];
    },
  });
};

export const useProductRatingSummary = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId, "summary"],
    queryFn: async () => {
      const res = (await apiClient.get(`/reviews/product/${productId}/summary`)) as any;
      return res.summary || { averageRating: res.averageRating, totalReviews: res.totalReviews, distribution: res.distribution } || null;
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
        if (!res) return { eligible: false, hasReviewed: false, review: null };
        return {
          eligible: res.eligible ?? false,
          hasReviewed: res.hasReviewed ?? false,
          review: res.review ?? null
        } as { eligible: boolean; hasReviewed: boolean; review: Review | null };
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

export const useReviewDraft = (reviewId: string | null) => {
  return useQuery({
    queryKey: ["reviews", "draft", reviewId],
    queryFn: async () => {
      if (!reviewId) return null;
      const res = (await apiClient.get(`/reviews/${reviewId}/form`)) as any;
      return res.review ?? null;
    },
    enabled: !!reviewId,
  });
};

export const useCreateReviewDraft = () => {
  return useMutation({
    mutationFn: async (data: { orderId: string; orderItemId: string }) => {
      const res = (await apiClient.post("/reviews/draft", data)) as any;
      return res.review as Review;
    },
  });
};

export const useUpdateReviewDraft = () => {
  return useMutation({
    mutationFn: async (data: { reviewId: string; payload: any }) => {
      const res = (await apiClient.put(`/reviews/${data.reviewId}/draft`, data.payload)) as any;
      return res.review as Review;
    },
  });
};

export const useSubmitReviewDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reviewId: string; payload: any }) => {
      const res = (await apiClient.post(`/reviews/${data.reviewId}/submit`, data.payload)) as any;
      return res.review as Review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
