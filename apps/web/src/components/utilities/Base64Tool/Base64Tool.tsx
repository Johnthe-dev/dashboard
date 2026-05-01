import { useState } from 'react'
import styles from './Base64Tool.module.scss'

type Mode = 'encode' | 'decode'

function encodeBase64(text: string, urlSafe: boolean): string {
  const b64 = btoa(unescape(encodeURIComponent(text)))
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : b64
}

function decodeBase64(b64: string, urlSafe: boolean): string {
  let normalized = urlSafe ? b64.replace(/-/g, '+').replace(/_/g, '/') : b64
  const pad = (4 - (normalized.length % 4)) % 4
  normalized += '='.repeat(pad)
  return decodeURIComponent(escape(atob(normalized)))
}

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const run = () => {
    if (!input.trim()) return
    try {
      setOutput(mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
      setOutput('')
    }
  }

  const swap = () => {
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'))
    setInput(output)
    setOutput('')
    setError('')
  }

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  const inputLabel = mode === 'encode' ? 'Plain text' : 'Base64 encoded'
  const outputLabel = mode === 'encode' ? 'Base64 encoded' : 'Plain text'

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Base64 Encoder / Decoder</h1>
      <p className={styles.description}>Encode text to Base64 or decode Base64 back to text.</p>

      <div className={styles.toolbar}>
        <div className={styles.modeToggle} role="group" aria-label="Mode">
          <button
            className={`${styles.modeBtn}${mode === 'encode' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => { setMode('encode'); setOutput(''); setError('') }}
            aria-pressed={mode === 'encode'}
          >
            Encode
          </button>
          <button
            className={`${styles.modeBtn}${mode === 'decode' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => { setMode('decode'); setOutput(''); setError('') }}
            aria-pressed={mode === 'decode'}
          >
            Decode
          </button>
        </div>

        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            className={styles.check}
            checked={urlSafe}
            onChange={(e) => { setUrlSafe(e.target.checked); setOutput(''); setError('') }}
          />
          URL-safe (RFC 4648)
        </label>
      </div>

      <div className={styles.panels}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>{inputLabel}</span>
          </div>
          <textarea
            className={styles.codeArea}
            value={input}
            onChange={(e) => { setInput(e.target.value); setOutput(''); setError('') }}
            spellCheck={false}
            aria-label={`${inputLabel} input`}
            placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 to decode…'}
          />
        </section>

        <div className={styles.arrow}>
          <button className={styles.runBtn} onClick={run} aria-label={mode === 'encode' ? 'Encode' : 'Decode'}>
            →
          </button>
          {output && (
            <button className={styles.swapBtn} onClick={swap} aria-label="Swap input and output">
              ⇄
            </button>
          )}
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>{outputLabel}</span>
            {output && (
              <button className={styles.btnGhost} onClick={copy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <pre className={styles.codeOutput} aria-live="polite">
            {error
              ? <span className={styles.errorText}>{error}</span>
              : output || <span className={styles.placeholder}>Output appears here</span>
            }
          </pre>
        </section>
      </div>

      <div className={styles.bottomActions}>
        <button className={styles.btnGhost} onClick={clear}>Clear all</button>
      </div>
    </div>
  )
}
