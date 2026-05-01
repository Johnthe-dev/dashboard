export interface ProjectRecord {
  id?: number
  moduleId: string
  name: string
  elapsedMs: number
  runningFrom: number | null
}
