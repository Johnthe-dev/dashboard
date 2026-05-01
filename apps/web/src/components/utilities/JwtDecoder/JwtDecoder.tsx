import { useState } from 'react'
import styles from './JwtDecoder.module.scss'

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('A JWT must have exactly 3 parts separated by dots')

  const decodeBase64Url = (str: string): Record<string, unknown> => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    try {
      return JSON.parse(atob(padded))
    } catch {
      throw new Error('Failed to decode JWT segment — token may be malformed')
    }
  }

  return {
    header: decodeBase64Url(parts[0]),
    payload: decodeBase64Url(parts[1]),
    signature: parts[2],
  }
}

function formatClaim(key: string, value: unknown): string {
  if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
    const d = new Date(value * 1000)
    return `${value}  (${d.toUTCString()})`
  }
  return String(value)
}

export function JwtDecoder() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState('')

  const decode = () => {
    try {
      setDecoded(decodeJwt(token))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decode')
      setDecoded(null)
    }
  }

  const clear = () => { setToken(''); setDecoded(null); setError('') }

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>JWT Decoder</h1>
      <p className={styles.description}>Decodes header and payload. Does not verify the signature.</p>

      <div className={styles.inputRow}>
        <textarea
          className={styles.tokenInput}
          value={token}
          onChange={(e) => { setToken(e.target.value); setDecoded(null); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) decode() }}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature"
          spellCheck={false}
          rows={3}
          aria-label="JWT token input"
        />
        <div className={styles.inputActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={decode}>Decode</button>
          <button className={styles.btnGhost} onClick={clear}>Clear</button>
        </div>
      </div>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {decoded && (
        <div className={styles.sections}>
          <section className={styles.section} aria-label="Header">
            <div className={styles.sectionHeader}>
              <span className={`${styles.badge} ${styles.badgeHeader}`}>HEADER</span>
              <span className={styles.sectionHint}>Algorithm &amp; token type</span>
            </div>
            <div className={styles.claims}>
              {Object.entries(decoded.header).map(([k, v]) => (
                <div key={k} className={styles.claim}>
                  <span className={styles.claimKey}>{k}</span>
                  <span className={styles.claimVal}>{String(v)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-label="Payload">
            <div className={styles.sectionHeader}>
              <span className={`${styles.badge} ${styles.badgePayload}`}>PAYLOAD</span>
              <span className={styles.sectionHint}>Data / claims</span>
            </div>
            <div className={styles.claims}>
              {Object.entries(decoded.payload).map(([k, v]) => (
                <div key={k} className={styles.claim}>
                  <span className={styles.claimKey}>{k}</span>
                  <span className={styles.claimVal}>{formatClaim(k, v)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-label="Signature">
            <div className={styles.sectionHeader}>
              <span className={`${styles.badge} ${styles.badgeSig}`}>SIGNATURE</span>
              <span className={styles.sectionHint}>Not verified — server-side only</span>
            </div>
            <code className={styles.sigValue}>{decoded.signature}</code>
          </section>
        </div>
      )}
    </div>
  )
}
