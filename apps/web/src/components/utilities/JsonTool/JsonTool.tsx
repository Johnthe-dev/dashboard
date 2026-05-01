import { useState } from 'react'
import styles from './JsonTool.module.scss'

type Status = 'idle' | 'valid' | 'error'

export function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const format = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setStatus('valid')
      setErrorMsg('')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const minify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setStatus('valid')
      setErrorMsg('')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const validate = () => {
    if (!input.trim()) return
    try {
      JSON.parse(input)
      setStatus('valid')
      setErrorMsg('')
      setOutput('')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>JSON Prettifier / Validator</h1>
      <p className={styles.description}>Format, minify, or validate JSON.</p>

      <div className={styles.panels}>
        <section className={styles.panel} aria-label="Input">
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Input</span>
            <div className={styles.actions}>
              <button className={styles.btn} onClick={validate}>Validate</button>
              <button className={styles.btn} onClick={minify}>Minify</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={format}>Format</button>
              <button className={styles.btnGhost} onClick={clear}>Clear</button>
            </div>
          </div>
          <textarea
            className={styles.codeArea}
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus('idle') }}
            placeholder='{ "paste": "your JSON here" }'
            spellCheck={false}
            aria-label="JSON input"
          />
          {status !== 'idle' && (
            <div className={`${styles.status} ${status === 'valid' ? styles.statusValid : styles.statusError}`}>
              {status === 'valid' ? '✓ Valid JSON' : `✗ ${errorMsg}`}
            </div>
          )}
        </section>

        <section className={styles.panel} aria-label="Output">
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Output</span>
            {output && (
              <button className={styles.btnGhost} onClick={copyOutput}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <pre className={styles.codeOutput} aria-live="polite" aria-label="Formatted JSON output">
            {output || <span className={styles.placeholder}>Formatted output will appear here</span>}
          </pre>
        </section>
      </div>
    </div>
  )
}
