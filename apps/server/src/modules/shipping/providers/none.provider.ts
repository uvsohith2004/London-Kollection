import { IShippingProvider } from "../shipping.interface";

export class NoneShippingProvider implements IShippingProvider {
  name = "none";

  async createShipment(order: any, credentials: any) {
    return {
      trackingNumber: `MOCK-${order.orderNumber || order.id}`,
    };
  }

  async trackShipment(trackingNumber: string, credentials: any) {
    return {
      status: "delivered",
      history: [
        { status: "delivered", timestamp: new Date() }
      ]
    };
  }

  async cancelShipment(trackingNumber: string, credentials: any) {
    return true;
  }

  async generateLabel(trackingNumber: string, credentials: any) {
    return `https://mock-label.com/${trackingNumber}.pdf`;
  }

  async validateRequest(credentials: any) {
    return true;
  }
}
