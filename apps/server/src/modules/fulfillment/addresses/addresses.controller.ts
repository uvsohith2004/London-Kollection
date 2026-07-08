import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { AddressesService } from "./addresses.service"

export class AddressesController {
  private service = new AddressesService()

  async list(c: Context) {
    const user = c.get("user")!
    const items = await this.service.listAddresses(user.id)
    return c.json(ok(items))
  }

  async create(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createAddress(user.id, body)
    return c.json(ok(item))
  }

  async update(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const item = await this.service.updateAddress(id, user.id, body)
    if (!item) {
      throw new NotFoundError("Address not found")
    }
    return c.json(ok(item))
  }

  async delete(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const item = await this.service.deleteAddress(id, user.id)
    if (!item) {
      throw new NotFoundError("Address not found")
    }
    return c.json(ok(item))
  }
}
