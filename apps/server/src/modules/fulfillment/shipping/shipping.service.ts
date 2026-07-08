import { BadRequestError } from "@/core/errors"
import { ShippingRegistry } from "../../providers/shipping.provider"

export class ShippingService {
  private providers = ShippingRegistry.getProviders()

  async getEstimate(destination: { country: string; state: string; postalCode: string }, items: { weight: number; quantity: number }[]) {
    const estimates = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          return await provider.estimate(destination, items)
        } catch (err) {
          console.error("Shipping provider estimation failed:", err)
          return null
        }
      })
    )

    const validEstimates = estimates.filter((e) => e !== null) as any[]
    if (validEstimates.length === 0) {
      throw new BadRequestError("No shipping estimates available")
    }

    // Find the max delivery days to show "Estimated delivery: Within X days"
    const maxDays = Math.max(...validEstimates.map((e) => e.deliveryDays))
    // Find the cheapest cost or average cost
    const minCost = Math.min(...validEstimates.map((e) => e.cost))

    return {
      estimatedDeliveryDays: maxDays,
      cost: minCost,
      message: `Estimated delivery: Within ${maxDays} days`,
    }
  }

  async createShipment(providerName: string, orderId: string, destination: any, items: any[]) {
    // Standard interface calls concrete carrier
    const activeProvider = this.providers.find(
      (p) => p.constructor.name.includes(providerName)
    ) || this.providers[0]

    return await activeProvider.createShipment(orderId, destination, items)
  }

  async trackShipment(providerName: string, trackingNumber: string) {
    const activeProvider = this.providers.find(
      (p) => p.constructor.name.includes(providerName)
    ) || this.providers[0]

    return await activeProvider.track(trackingNumber)
  }
}
