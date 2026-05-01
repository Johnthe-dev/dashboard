export interface CalendarMark {
  date: string // YYYY-MM-DD
}

export interface CalendarRecord {
  moduleId: string
  marks: CalendarMark[]
}
