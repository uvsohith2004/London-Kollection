import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { adminQueries } from "@/queries/admin.queries"
import { OverviewDashboard } from "./components/overview-dashboard"

export default async function OverviewPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(adminQueries.dashboardData())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewDashboard />
    </HydrationBoundary>
  )
}
