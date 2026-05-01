import { useState } from 'react'
import styles from './EpochConverter.module.scss'

type EpochUnit = 'seconds' | 'milliseconds'

function formatRelative(ms: number): string {
  const diff = Date.now() - ms
  const abs = Math.abs(diff)
  const future = diff < 0
  const suffix = future ? 'from now' : 'ago'

  if (abs < 60_000) return `${Math.round(abs / 1000)} seconds ${suffix}`
  if (abs < 3_600_000) return `${Math.round(abs / 60_000)} minutes ${suffix}`
  if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)} hours ${suffix}`
  if (abs < 31_536_000_000) return `${Math.round(abs / 86_400_000)} days ${suffix}`
  return `${Math.round(abs / 31_536_000_000)} years ${suffix}`
}

function padDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

interface EpochResult {
  utc: string
  local: string
  iso: string
  relative: string
  ms: number
}

function epochToResults(epoch: string, unit: EpochUnit): EpochResult | null {
  const raw = parseFloat(epoch)
  if (isNaN(raw)) return null
  const ms = unit === 'seconds' ? raw * 1000 : raw
  const d = new Date(ms)
  if (isNaN(d.getTime())) return null
  return {
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    iso: d.toISOString(),
    relative: formatRelative(ms),
    ms,
  }
}

export function EpochConverter() {
  const [epoch, setEpoch] = useState('')
  const [epochUnit, setEpochUnit] = useState<EpochUnit>('seconds')
  const [dateInput, setDateInput] = useState('')
  const now = new Date()

  const epochResult = epochToResults(epoch, epochUnit)

  const setNow = () => {
    setEpoch(epochUnit === 'seconds' ? String(Math.floor(Date.now() / 1000)) : String(Date.now()))
  }

  const dateToEpochSecs = dateInput ? Math.floor(new Date(dateInput).getTime() / 1000) : null
  const dateToEpochMs = dateInput ? new Date(dateInput).getTime() : null
  const dateValid = dateInput && dateToEpochMs !== null && !isNaN(dateToEpochMs)

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Epoch / Timestamp Converter</h1>
      <p className={styles.description}>
        Convert Unix timestamps to human-readable dates and vice versa.
        Current time: <span className={styles.mono}>{Math.floor(Date.now() / 1000)}</span> seconds /&nbsp;
        <span className={styles.mono}>{Date.now()}</span> ms
      </p>

      <div className={styles.grid}>
        {/* Epoch → Date */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Epoch → Date</h2>

          <div className={styles.row}>
            <label className={styles.label} htmlFor="epochInput">Unix timestamp</label>
            <div className={styles.inputGroup}>
              <input
                id="epochInput"
                className={styles.input}
                type="number"
                value={epoch}
                onChange={(e) => setEpoch(e.target.value)}
                placeholder="e.g. 1700000000"
                aria-label="Unix epoch timestamp"
              />
              <div className={styles.unitToggle} role="group" aria-label="Unit">
                <button
                  className={`${styles.unitBtn}${epochUnit === 'seconds' ? ` ${styles.unitBtnActive}` : ''}`}
                  onClick={() => setEpochUnit('seconds')}
                  aria-pressed={epochUnit === 'seconds'}
                >
                  s
                </button>
                <button
                  className={`${styles.unitBtn}${epochUnit === 'milliseconds' ? ` ${styles.unitBtnActive}` : ''}`}
                  onClick={() => setEpochUnit('milliseconds')}
                  aria-pressed={epochUnit === 'milliseconds'}
                >
                  ms
                </button>
              </div>
              <button className={styles.nowBtn} onClick={setNow}>Now</button>
            </div>
          </div>

          {epochResult && (
            <dl className={styles.results}>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>UTC</dt>
                <dd className={styles.resultVal}>{epochResult.utc}</dd>
              </div>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>Local</dt>
                <dd className={styles.resultVal}>{epochResult.local}</dd>
              </div>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>ISO 8601</dt>
                <dd className={styles.resultVal}>{epochResult.iso}</dd>
              </div>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>Relative</dt>
                <dd className={styles.resultVal}>{epochResult.relative}</dd>
              </div>
            </dl>
          )}
          {epoch && !epochResult && (
            <p className={styles.error}>Invalid timestamp</p>
          )}
        </section>

        {/* Date → Epoch */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Date → Epoch</h2>

          <div className={styles.row}>
            <label className={styles.label} htmlFor="dateInput">Date and time</label>
            <div className={styles.inputGroup}>
              <input
                id="dateInput"
                className={styles.input}
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                aria-label="Date and time input"
              />
              <button
                className={styles.nowBtn}
                onClick={() => setDateInput(padDatetimeLocal(now))}
              >
                Now
              </button>
            </div>
          </div>

          {dateValid && (
            <dl className={styles.results}>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>Seconds</dt>
                <dd className={`${styles.resultVal} ${styles.mono}`}>{dateToEpochSecs}</dd>
              </div>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>Milliseconds</dt>
                <dd className={`${styles.resultVal} ${styles.mono}`}>{dateToEpochMs}</dd>
              </div>
              <div className={styles.resultRow}>
                <dt className={styles.resultKey}>Relative</dt>
                <dd className={styles.resultVal}>{formatRelative(dateToEpochMs!)}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>
    </div>
  )
}
