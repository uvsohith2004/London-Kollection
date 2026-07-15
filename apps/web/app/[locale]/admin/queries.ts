import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { adminQueries } from "@/queries/admin.queries";
import { CategoryApi } from "@/api/categories";
import { CollectionApi } from "@/api/collections";
import { OccasionApi } from "@/api/occasions";
import { AdminApi } from "@/api/admin";
import { ReviewApi } from "@/api/reviews";
import { SettingsApi } from "@/api/settings";
import { HeroApi } from "@/api/hero";
import { FlashSaleApi } from "@/api/flash-sale";

export const adminKeys = adminQueries;

export function useAdminProductsQuery(params?: any) {
  return useQuery(adminQueries.productList(params));
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminQueries.categories(),
    queryFn: () => CategoryApi.getAll(),
  });
}

export function useAdminCollectionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminQueries.collections(), params],
    queryFn: () => CollectionApi.getAdminAll(params),
  });
}

export function useAdminOccasionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminQueries.occasions(), params],
    queryFn: () => OccasionApi.getAll(),
  });
}

export function useAdminBrandsQuery(params?: any) {
  return useQuery(adminQueries.brandList(params));
}

export function useTaxClassesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminQueries.taxes(), "classes", params],
    queryFn: () => AdminApi.getTaxClasses(params),
  });
}

export function useTaxRatesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminQueries.taxes(), "rates", params],
    queryFn: () => AdminApi.getTaxRates(params),
  });
}

export function useTaxRulesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminQueries.taxes(), "rules", params],
    queryFn: () => AdminApi.getTaxRules(params),
  });
}

export function useAdminOrdersQuery(params?: any) {
  return useQuery(adminQueries.orderList(params));
}

export function useInfiniteAdminOrdersQuery(params?: any) {
  return useInfiniteQuery({
    queryKey: [...adminQueries.orderList(params).queryKey, "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await AdminApi.getOrders({ ...params, page: pageParam });
      return res; // Assuming res contains { data: { items, hasMore, nextCursor, counts, total } } or similar
    },
    getNextPageParam: (lastPage: any) => {
      // The API wrapper usually unwraps the "data" envelope, so lastPage might BE the payload directly.
      const payload = lastPage?.data || lastPage;
      return payload?.nextCursor || undefined;
    },
    initialPageParam: 1,
  });
}

export function useAdminReturnsQuery(params?: any) {
  return useQuery(adminQueries.returnList(params));
}

export function useAdminUsersQuery(params?: any) {
  return useQuery(adminQueries.userList(params));
}

export function useAdminReviewsQuery() {
  return useQuery({
    queryKey: adminQueries.reviews(),
    queryFn: () => ReviewApi.getAll(),
  });
}

export function useDashboardQuery(range?: string) {
  return useQuery(adminQueries.dashboardData(range));
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: adminQueries.settings(),
    queryFn: () => AdminApi.getSettings(),
  });
}

export function useAuditLogsQuery() {
  return useQuery(adminQueries.auditLogList());
}

export function useAdminFlashSaleQuery() {
  return useQuery({
    queryKey: adminQueries.flashSale(),
    queryFn: () => AdminApi.getFlashSale(),
  });
}

export function useAdminHeroCarouselQuery() {
  return useQuery({
    queryKey: adminQueries.heroCarousel(),
    queryFn: () => AdminApi.getHeroCarousel(),
  });
}

export function useAdminFeaturedPiecesQuery() {
  return useQuery({
    queryKey: adminQueries.featuredPieces(),
    queryFn: () => AdminApi.getFeaturedPieces(),
  });
}

export function useAdminFeaturedCollectionsQuery() {
  return useQuery({
    queryKey: adminQueries.featuredCollections(),
    queryFn: () => AdminApi.getFeaturedCollections(),
  });
}



