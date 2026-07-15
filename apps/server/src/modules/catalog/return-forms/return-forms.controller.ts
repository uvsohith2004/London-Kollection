import { Context } from "hono"
import { ok } from "@/core/response"
import { ReturnFormsService } from "./return-forms.service"

export class ReturnFormsController {
  private service = new ReturnFormsService()

  async getForms(c: Context) {
    const forms = await this.service.getForms()
    return c.json(ok({ forms }))
  }

  async getFormById(c: Context) {
    const id = c.req.param("id")
    const form = await this.service.getFormById(id)
    return c.json(ok({ form }))
  }

  async createForm(c: Context) {
    const body = await c.req.json()
    const form = await this.service.createForm(body)
    return c.json(ok({ form }), 201)
  }

  async updateForm(c: Context) {
    const id = c.req.param("id")
    const body = await c.req.json()
    const form = await this.service.updateForm(id, body)
    return c.json(ok({ form }))
  }

  async deleteForm(c: Context) {
    const id = c.req.param("id")
    const form = await this.service.deleteForm(id)
    return c.json(ok({ form }))
  }
}
