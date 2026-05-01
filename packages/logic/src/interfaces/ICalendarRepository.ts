import type { CalendarRecord } from '../types/calendar'

export interface ICalendarRepository {
  getCalendar(moduleId: string): Promise<CalendarRecord | null>
  putCalendar(record: CalendarRecord): Promise<void>
  deleteCalendar(moduleId: string): Promise<void>
  getAllCalendars(): Promise<CalendarRecord[]>
  clearAllCalendars(): Promise<void>
}
