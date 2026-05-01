import type { ICalendarRepository } from '@focal/logic'
import type { CalendarRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbCalendarRepository implements ICalendarRepository {
  async getCalendar(moduleId: string): Promise<CalendarRecord | null> {
    const db = await getDb()
    return (await db.get(STORES.CALENDARS, moduleId)) ?? null
  }

  async putCalendar(record: CalendarRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.CALENDARS, record)
  }

  async deleteCalendar(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.CALENDARS, moduleId)
  }

  async getAllCalendars(): Promise<CalendarRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.CALENDARS)
  }

  async clearAllCalendars(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.CALENDARS)
  }
}
