import db from "@/db"
import { setting } from "@/db/schemas"
import { eq } from "drizzle-orm"
import { cache } from "@/cache"
import { reloadConfig } from "@/config"

export class SettingsService {
  async getSettings() {
    const cached = await cache.get<any>(`settings:global`)
    if (cached) return cached

    let [result] = await db.select().from(setting).where(eq(setting.id, 'global'))
    if (!result) {
      const [created] = await db.insert(setting).values({ id: 'global' }).returning()
      result = created
    }
    
    await cache.set(`settings:global`, result, 3600)
    
    return result
  }

  async updateSettings(payload: any) {
    const existing = await db.select().from(setting).where(eq(setting.id, 'global'))
    
    let updatedOrCreated
    if (existing.length > 0) {
      const [updated] = await db
        .update(setting)
        .set({
          ...payload,
          updatedAt: new Date(),
        })
        .where(eq(setting.id, 'global'))
        .returning()
      updatedOrCreated = updated
    } else {
      const [created] = await db
        .insert(setting)
        .values({
          id: 'global',
          ...payload,
        })
        .returning()
      updatedOrCreated = created
    }

    await cache.set(`settings:global`, updatedOrCreated, 3600)
    await reloadConfig()
    
    return updatedOrCreated
  }
}
