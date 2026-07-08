import { Context } from "hono"
import { ok, created } from "@/core/response"
import { TaxesService } from "./taxes.service"

export class TaxesController {
  private service = new TaxesService()

  // -- Classes --
  async getAllTaxClasses(c: Context) {
    const search = c.req.query("q")
    const items = await this.service.getAllTaxClasses(search)
    return c.json(ok({ items }))
  }

  async createTaxClass(c: Context) {
    const body = c.req.valid("json" as never)
    const item = await this.service.createTaxClass(body)
    return c.json(created(item), 201)
  }

  async updateTaxClass(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const item = await this.service.updateTaxClass(id, body)
    return c.json(ok(item))
  }

  async deleteTaxClass(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteTaxClass(id)
    return c.json(ok({ success: true }))
  }

  // -- Rates --
  async getAllTaxRates(c: Context) {
    const search = c.req.query("q")
    const items = await this.service.getAllTaxRates(search)
    return c.json(ok({ items }))
  }

  async createTaxRate(c: Context) {
    const body = c.req.valid("json" as never)
    const item = await this.service.createTaxRate(body)
    return c.json(created(item), 201)
  }

  async updateTaxRate(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const item = await this.service.updateTaxRate(id, body)
    return c.json(ok(item))
  }

  async deleteTaxRate(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteTaxRate(id)
    return c.json(ok({ success: true }))
  }

  // -- Rules --
  async getAllTaxRules(c: Context) {
    const items = await this.service.getAllTaxRules()
    return c.json(ok({ items }))
  }

  async createTaxRule(c: Context) {
    const body = c.req.valid("json" as never)
    const item = await this.service.createTaxRule(body)
    return c.json(created(item), 201)
  }

  async updateTaxRule(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const item = await this.service.updateTaxRule(id, body)
    return c.json(ok(item))
  }

  async deleteTaxRule(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteTaxRule(id)
    return c.json(ok({ success: true }))
  }
}
