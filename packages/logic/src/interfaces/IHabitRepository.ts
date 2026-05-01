import type { HabitRecord } from '../types/habit'

export interface IHabitRepository {
  getHabitRecord(moduleId: string): Promise<HabitRecord | null>
  putHabitRecord(r: HabitRecord): Promise<void>
  deleteHabitRecord(moduleId: string): Promise<void>
  getAllHabits(): Promise<HabitRecord[]>
  clearAllHabits(): Promise<void>
}
