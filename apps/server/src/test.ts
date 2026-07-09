import db from "./db"
import { cart } from "./db/schemas"
import { CheckoutService } from "./modules/checkout/checkout.service"

async function run() {
  const latestCart = await db.query.cart.findFirst({
    with: { items: true },
    orderBy: (cart, { desc }) => [desc(cart.updatedAt)]
  })
  
  if (!latestCart) {
    console.log("No cart found")
    return
  }
  
  console.log("Latest Cart:", latestCart)
  
  const checkoutService = new CheckoutService()
  
  try {
    const preview = await checkoutService.previewOrder("guest", {
      cartId: latestCart.id,
      shippingCountryCode: "Kuwait"
    })
    
    console.log("Preview:", preview)
  } catch (e) {
    console.error("Error previewing order:", e)
  }
}

run().then(() => process.exit(0))
