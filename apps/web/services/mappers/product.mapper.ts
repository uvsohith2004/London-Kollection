import type { Product } from "@workspace/api-contracts";

export interface ProductViewModel extends Product {
  formattedPrice: string;
}

export const mapProductToView = (product: Product): ProductViewModel => {
  const price = Number(product.price);

  return {
    ...product,
    formattedPrice: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price),
  };
};
