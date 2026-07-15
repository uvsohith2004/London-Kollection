import { get } from "../client";

export const SettingsApi = {
  getStoreSettings: async () => {
    return await get("/store/settings");
  }
};
