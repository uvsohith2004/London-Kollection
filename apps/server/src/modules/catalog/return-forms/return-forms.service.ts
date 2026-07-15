import { NotFoundError } from "@/core/errors/http-errors"
import db from "@/db"
import { returnForm } from "@/db/schemas"
import { eq } from "drizzle-orm"

export class ReturnFormsService {
  async getForms() {
    return await db.select().from(returnForm).orderBy(returnForm.createdAt)
  }

  async getFormById(id: string) {
    const form = await db.query.returnForm.findFirst({
      where: eq(returnForm.id, id),
    })
    if (!form) throw new NotFoundError("Return form not found")
    return form
  }

  async createForm(data: { name: string; description?: string; schema: any[] }) {
    const [newForm] = await db
      .insert(returnForm)
      .values({
        name: data.name,
        description: data.description,
        schema: data.schema,
        version: 1,
      })
      .returning()
    return newForm
  }

  async updateForm(id: string, data: { name?: string; description?: string; schema?: any[] }) {
    const existing = await this.getFormById(id)
    
    // When schema changes, we increment version.
    const newVersion = data.schema ? existing.version + 1 : existing.version
    
    const [updated] = await db
      .update(returnForm)
      .set({
        ...data,
        version: newVersion,
      })
      .where(eq(returnForm.id, id))
      .returning()

    return updated
  }

  async deleteForm(id: string) {
    const [deleted] = await db.delete(returnForm).where(eq(returnForm.id, id)).returning()
    if (!deleted) throw new NotFoundError("Return form not found")
    return deleted
  }
}
