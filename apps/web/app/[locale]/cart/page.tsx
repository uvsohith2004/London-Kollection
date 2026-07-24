import { CartClientView } from "./client-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View the items in your shopping cart.",
  robots: {
    index: false,
    follow: false,
  }
}
export default function CartPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-32 md:pt-32 md:pb-12">
      <CartClientView />
    </main>
  )
}
