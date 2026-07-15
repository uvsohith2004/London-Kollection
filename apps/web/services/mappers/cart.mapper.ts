import { CartSummary } from "@/api/cart";

export interface CartViewModel extends CartSummary {
  formattedSubtotal: string;
  formattedGrandTotal: string;
  formattedDeliveryFee: string;
  itemCount: number;
}

export const mapCartToView = (cart: CartSummary): CartViewModel => {
  const formatter = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
  
  return {
    ...cart,
    itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    formattedSubtotal: formatter.format(cart.subtotal),
    formattedGrandTotal: formatter.format(cart.grandTotal),
    formattedDeliveryFee: cart.deliveryFee > 0 ? formatter.format(cart.deliveryFee) : "Free",
  };
};
