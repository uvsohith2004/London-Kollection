"use client";

import * as React from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, MessageSquare } from "lucide-react";
import { MobilePager } from "./mobile-pager";
import { OverviewDashboard } from "./overview-dashboard";
import { ProductsTab } from "../products/components/products-tab";
import OrdersClientPage from "../orders/client-page";
import CustomersClientPage from "../customers/client-page";
import { ReviewFormsClient } from "../review-forms/client-page";

export function MobileApp() {
  const items = React.useMemo(() => [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      component: <OverviewDashboard />,
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      component: <OrdersClientPage />,
    },
    {
      name: "Products",
      icon: Package,
      component: <ProductsTab initialData={undefined} initialQuery="" />,
    },
    {
      name: "Customers",
      icon: Users,
      component: <CustomersClientPage />,
    },
    {
      name: "Reviews",
      icon: MessageSquare,
      component: <ReviewFormsClient initialData={[]} />,
    },
  ], []);

  return <MobilePager items={items} />;
}
