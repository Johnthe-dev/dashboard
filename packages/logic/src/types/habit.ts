export interface HabitItem {
  id: number
  name: string
  color: string
}

export interface HabitRecord {
  moduleId: string
  habits: HabitItem[]
  /** Entries are "YYYY-MM-DD:habitId" strings */
  completions: string[]
}

export const HABIT_COLORS = [
  '#e57373',
  '#ff9800',
  '#ffd54f',
  '#81c784',
  '#4dd0e1',
  '#64b5f6',
  '#ba68c8',
  '#f06292',
]
