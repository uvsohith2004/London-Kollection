import db from "@/db"
import { taxClass, taxRate, taxRule } from "@/db/schemas"
import { eq, or, ilike } from "drizzle-orm"
import { BadRequestError, NotFoundError } from "@/core/errors"

export class TaxesService {
  // -- Tax Classes --
  async getAllTaxClasses(search?: string) {
    if (search) {
      return await db.query.taxClass.findMany({
        where: ilike(taxClass.name, `%${search}%`),
        orderBy: (tc, { desc }) => [desc(tc.createdAt)]
      })
    }
    return await db.query.taxClass.findMany({
      orderBy: (tc, { desc }) => [desc(tc.createdAt)]
    })
  }

  async createTaxClass(data: any) {
    const [newItem] = await db.insert(taxClass).values(data).returning()
    return newItem
  }

  async updateTaxClass(id: string, data: any) {
    const [updated] = await db
      .update(taxClass)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxClass.id, id))
      .returning()
    if (!updated) throw new NotFoundError("Tax class not found")
    return updated
  }

  async deleteTaxClass(id: string) {
    const [deleted] = await db.delete(taxClass).where(eq(taxClass.id, id)).returning()
    if (!deleted) throw new NotFoundError("Tax class not found")
    return { success: true }
  }

  // -- Tax Rates --
  async getAllTaxRates(search?: string) {
    if (search) {
      return await db.query.taxRate.findMany({
        where: or(
          ilike(taxRate.name, `%${search}%`),
          ilike(taxRate.countryCode, `%${search}%`)
        ),
        orderBy: (tr, { desc }) => [desc(tr.createdAt)]
      })
    }
    return await db.query.taxRate.findMany({
      orderBy: (tr, { desc }) => [desc(tr.createdAt)]
    })
  }

  async createTaxRate(data: any) {
    const [newItem] = await db.insert(taxRate).values({
      ...data,
      percentage: data.percentage.toString(),
    }).returning()
    return newItem
  }

  async updateTaxRate(id: string, data: any) {
    const updateData = { ...data, updatedAt: new Date() }
    if (data.percentage !== undefined) {
      updateData.percentage = data.percentage.toString()
    }
    const [updated] = await db
      .update(taxRate)
      .set(updateData)
      .where(eq(taxRate.id, id))
      .returning()
    if (!updated) throw new NotFoundError("Tax rate not found")
    return updated
  }

  async deleteTaxRate(id: string) {
    const [deleted] = await db.delete(taxRate).where(eq(taxRate.id, id)).returning()
    if (!deleted) throw new NotFoundError("Tax rate not found")
    return { success: true }
  }

  // -- Tax Rules --
  async getAllTaxRules() {
    return await db.query.taxRule.findMany({
      with: {
        taxClass: true,
        taxRate: true,
      },
      orderBy: (tr, { desc }) => [desc(tr.createdAt)]
    })
  }

  async createTaxRule(data: any) {
    const [newItem] = await db.insert(taxRule).values({
      name: data.name,
      taxClassId: data.taxClassId,
      taxRateId: data.taxRateId,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
    }).returning()
    return newItem
  }

  async updateTaxRule(id: string, data: any) {
    const [updated] = await db
      .update(taxRule)
      .set({
        ...data,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
        updatedAt: new Date() 
      })
      .where(eq(taxRule.id, id))
      .returning()
    if (!updated) throw new NotFoundError("Tax rule not found")
    return updated
  }

  async deleteTaxRule(id: string) {
    const [deleted] = await db.delete(taxRule).where(eq(taxRule.id, id)).returning()
    if (!deleted) throw new NotFoundError("Tax rule not found")
    return { success: true }
  }
}
