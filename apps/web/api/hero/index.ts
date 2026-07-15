import { get } from "../client";
import type { BannerCarouselResponse } from "@workspace/api-contracts";

export const HeroApi = {
  getCarouselImages: async (): Promise<BannerCarouselResponse> => {
    return await get("/hero-carousel");
  }
};
