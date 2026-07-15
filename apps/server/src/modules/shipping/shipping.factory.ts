import { IShippingProvider } from "./shipping.interface";
import { NoneShippingProvider } from "./providers/none.provider";
import { AramexShippingProvider } from "./providers/aramex.provider";
import { FedExShippingProvider } from "./providers/fedex.provider";
import { SettingsService } from "../administration/management/settings.service";

export class ShippingFactory {
  private static providers: Record<string, IShippingProvider> = {
    none: new NoneShippingProvider(),
    aramex: new AramexShippingProvider(),
    fedex: new FedExShippingProvider(),
  };

  /**
   * Returns the currently active shipping provider adapter
   * based on the application's global settings.
   */
  static async getActiveProvider(): Promise<{ provider: IShippingProvider; credentials: any }> {
    const settingsService = new SettingsService();
    const settings = await settingsService.getSettings();
    
    const providerName = settings.shippingProvider || "none";
    const credentials = settings.shippingCredentials || {};

    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Shipping provider '${providerName}' is not supported.`);
    }

    return { provider, credentials };
  }

  /**
   * Returns a specific provider adapter by name, useful for validation when saving settings.
   */
  static getProviderByName(name: string): IShippingProvider {
    const provider = this.providers[name];
    if (!provider) {
      throw new Error(`Shipping provider '${name}' is not supported.`);
    }
    return provider;
  }
}
