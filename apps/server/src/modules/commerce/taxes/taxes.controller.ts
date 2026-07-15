import { Context } from "hono"
import { ok, created } from "@/core/response"
import { TaxesService } from "./taxes.service"
import {
  transformTaxClass,
  transformTaxClassList,
  transformTaxRate,
  transformTaxRateList,
  transformTaxRule,
  transformTaxRuleList,
} from "@/core/transformers/tax.transformer"

export class TaxesController {
  private service = new TaxesService()

  // -- Classes --
  async getAllTaxClasses(c: Context) {
    const search = c.req.query("q")
    const rawItems = await this.service.getAllTaxClasses(search)
    const items = rawItems.map(transformTaxClassList)
    return c.json(ok({ items }))
  }

  async createTaxClass(c: Context) {
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.createTaxClass(body)
    const item = transformTaxClass(rawItem)
    return c.json(created(item), 201)
  }

  async updateTaxClass(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.updateTaxClass(id, body)
    const item = transformTaxClass(rawItem)
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
    const rawItems = await this.service.getAllTaxRates(search)
    const items = rawItems.map(transformTaxRateList)
    return c.json(ok({ items }))
  }

  async createTaxRate(c: Context) {
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.createTaxRate(body)
    const item = transformTaxRate(rawItem)
    return c.json(created(item), 201)
  }

  async updateTaxRate(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.updateTaxRate(id, body)
    const item = transformTaxRate(rawItem)
    return c.json(ok(item))
  }

  async deleteTaxRate(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteTaxRate(id)
    return c.json(ok({ success: true }))
  }

  // -- Rules --
  async getAllTaxRules(c: Context) {
    const rawItems = await this.service.getAllTaxRules()
    const items = rawItems.map(transformTaxRuleList)
    return c.json(ok({ items }))
  }

  async createTaxRule(c: Context) {
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.createTaxRule(body)
    const item = transformTaxRule(rawItem)
    return c.json(created(item), 201)
  }

  async updateTaxRule(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never)
    const rawItem = await this.service.updateTaxRule(id, body)
    const item = transformTaxRule(rawItem)
    return c.json(ok(item))
  }

  async deleteTaxRule(c: Context) {
    const id = c.req.param("id")!
    await this.service.deleteTaxRule(id)
    return c.json(ok({ success: true }))
  }
}
