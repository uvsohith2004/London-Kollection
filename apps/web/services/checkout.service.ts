import { CheckoutApi } from "@/api-client/checkout";
import { AddressApi } from "@/api-client/addresses";

export const CheckoutService = {
  getPreview: async (payload: { cartId: string; shippingCountryCode: string }) => {
    return await CheckoutApi.preview(payload);
  },
  submitCheckout: async (payload: { cartId: string; shippingAddressId: string; billingAddressId?: string }) => {
    return await CheckoutApi.submit(payload);
  },
  getAddresses: async () => {
    return await AddressApi.getAll();
  },
  createAddress: async (payload: any) => {
    return await AddressApi.create(payload);
  },
  updateAddress: async (id: string, payload: any) => {
    return await AddressApi.update(id, payload);
  },
  deleteAddress: async (id: string) => {
    return await AddressApi.delete(id);
  },
  setDefaultAddress: async (id: string, type: string = "shipping") => {
    return await AddressApi.setDefault(id, type);
  }
};
