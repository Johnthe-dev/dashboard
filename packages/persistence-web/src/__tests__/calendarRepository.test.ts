import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { IdbCalendarRepository } from '../db/calendarRepository'
import type { CalendarRecord } from '@focal/logic'

const repo = new IdbCalendarRepository()

describe('IdbCalendarRepository', () => {
  beforeEach(async () => {
    await repo.clearAllCalendars()
  })

  it('getCalendar returns null for an unknown moduleId', async () => {
    const result = await repo.getCalendar('nonexistent')
    expect(result).toBeNull()
  })

  it('putCalendar then getCalendar round-trips correctly', async () => {
    const record: CalendarRecord = {
      moduleId: 'cal-1',
      marks: [{ date: '2024-01-15' }, { date: '2024-01-20' }],
    }
    await repo.putCalendar(record)
    const result = await repo.getCalendar('cal-1')
    expect(result).not.toBeNull()
    expect(result!.moduleId).toBe('cal-1')
    expect(result!.marks).toHaveLength(2)
    expect(result!.marks[0].date).toBe('2024-01-15')
  })

  it('putCalendar twice with same moduleId updates (upsert)', async () => {
    await repo.putCalendar({ moduleId: 'cal-upsert', marks: [{ date: '2024-01-01' }] })
    await repo.putCalendar({ moduleId: 'cal-upsert', marks: [{ date: '2024-02-01' }, { date: '2024-03-01' }] })
    const result = await repo.getCalendar('cal-upsert')
    expect(result!.marks).toHaveLength(2)
    expect(result!.marks[0].date).toBe('2024-02-01')
  })

  it('deleteCalendar removes the record; getCalendar returns null', async () => {
    await repo.putCalendar({ moduleId: 'cal-del', marks: [] })
    await repo.deleteCalendar('cal-del')
    const result = await repo.getCalendar('cal-del')
    expect(result).toBeNull()
  })

  it('getAllCalendars returns all records', async () => {
    await repo.putCalendar({ moduleId: 'cal-a', marks: [] })
    await repo.putCalendar({ moduleId: 'cal-b', marks: [{ date: '2024-05-01' }] })
    await repo.putCalendar({ moduleId: 'cal-c', marks: [] })
    const all = await repo.getAllCalendars()
    expect(all).toHaveLength(3)
    const ids = all.map((r) => r.moduleId)
    expect(ids).toContain('cal-a')
    expect(ids).toContain('cal-b')
    expect(ids).toContain('cal-c')
  })

  it('clearAllCalendars empties the store', async () => {
    await repo.putCalendar({ moduleId: 'cal-x', marks: [] })
    await repo.putCalendar({ moduleId: 'cal-y', marks: [] })
    await repo.clearAllCalendars()
    const all = await repo.getAllCalendars()
    expect(all).toHaveLength(0)
  })
})
