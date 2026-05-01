export type CountdownStatus = 'idle' | 'running' | 'paused' | 'done'

export interface CountdownRecord {
  moduleId: string
  durationMs: number
  remainingMs: number
  status: CountdownStatus
}
