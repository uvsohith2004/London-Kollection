export interface ShippingEstimate {
  provider: string
  cost: number
  deliveryDays: number
}

export interface ShippingProvider {
  estimate(destination: { country: string; state: string; postalCode: string }, items: { weight: number; quantity: number }[]): Promise<ShippingEstimate>
  createShipment(orderId: string, destination: any, items: any[]): Promise<{ trackingNumber: string; labelUrl?: string }>
  cancelShipment(trackingNumber: string): Promise<boolean>
  track(trackingNumber: string): Promise<{ status: string; history: { status: string; location: string; timestamp: Date }[] }>
}

export class MockShippingProviderA implements ShippingProvider {
  async estimate(destination: { country: string; state: string; postalCode: string }, items: { weight: number; quantity: number }[]): Promise<ShippingEstimate> {
    return {
      provider: "CarrierA",
      cost: 5.99,
      deliveryDays: 5,
    }
  }

  async createShipment(orderId: string, destination: any, items: any[]) {
    return {
      trackingNumber: `TRK_A_${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: "https://carrier-a.com/labels/mock-label.pdf",
    }
  }

  async cancelShipment(trackingNumber: string) {
    return true
  }

  async track(trackingNumber: string) {
    return {
      status: "In Transit",
      history: [
        { status: "Shipment Created", location: "Warehouse A", timestamp: new Date() },
      ],
    }
  }
}

export class MockShippingProviderB implements ShippingProvider {
  async estimate(destination: { country: string; state: string; postalCode: string }, items: { weight: number; quantity: number }[]): Promise<ShippingEstimate> {
    return {
      provider: "CarrierB",
      cost: 3.99,
      deliveryDays: 10,
    }
  }

  async createShipment(orderId: string, destination: any, items: any[]) {
    return {
      trackingNumber: `TRK_B_${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: "https://carrier-b.com/labels/mock-label.pdf",
    }
  }

  async cancelShipment(trackingNumber: string) {
    return true
  }

  async track(trackingNumber: string) {
    return {
      status: "Shipped",
      history: [
        { status: "Package picked up", location: "Warehouse B", timestamp: new Date() },
      ],
    }
  }
}

export class ShippingRegistry {
  static getProviders(): ShippingProvider[] {
    return [new MockShippingProviderA(), new MockShippingProviderB()]
  }
}
