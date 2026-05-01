import type { CountdownRecord } from '../types/countdown'

export interface ICountdownRepository {
  getCountdown(moduleId: string): Promise<CountdownRecord | undefined>
  putCountdown(record: CountdownRecord): Promise<void>
  deleteCountdown(moduleId: string): Promise<void>
  getAllCountdowns(): Promise<CountdownRecord[]>
  clearAllCountdowns(): Promise<void>
}
