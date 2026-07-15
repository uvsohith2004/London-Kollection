export interface IShippingProvider {
  /** The internal identifier for the provider (e.g. 'none', 'aramex', 'fedex') */
  name: string;

  /** Create a shipment for a given order */
  createShipment(order: any, credentials: any): Promise<{ trackingNumber: string; labelUrl?: string }>;

  /** Get tracking updates for a shipment */
  trackShipment(trackingNumber: string, credentials: any): Promise<{ status: string; history: any[] }>;

  /** Cancel an existing shipment (if supported) */
  cancelShipment(trackingNumber: string, credentials: any): Promise<boolean>;

  /** Generate or retrieve a shipping label URL/buffer */
  generateLabel(trackingNumber: string, credentials: any): Promise<string>;

  /** Validate the provider credentials to ensure they are correct */
  validateRequest(credentials: any): Promise<boolean>;
}
