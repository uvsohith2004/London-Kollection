import { post } from "../client";

export const CheckoutApi = {
  preview: async (payload: { cartId: string; shippingCountryCode: string }) => {
    return await post(`/checkout/preview`, payload);
  },
  submit: async (payload: { cartId: string; shippingAddressId: string; billingAddressId?: string }) => {
    return await post(`/checkout`, payload);
  }
};
