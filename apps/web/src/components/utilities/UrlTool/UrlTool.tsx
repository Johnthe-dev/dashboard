import { useState, useMemo } from 'react'
import styles from './UrlTool.module.scss'

type Tab = 'encode' | 'parse'

function safeDecode(s: string): { result: string; error: string } {
  try { return { result: decodeURIComponent(s), error: '' } }
  catch (e) { return { result: '', error: e instanceof Error ? e.message : 'Malformed URI sequence' } }
}

interface ParsedUrl {
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  params: [string, string][]
  hash: string
}

function parseUrl(raw: string): ParsedUrl | null {
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    return {
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      params: [...url.searchParams.entries()],
      hash: url.hash,
    }
  } catch { return null }
}

export function UrlTool() {
  const [tab, setTab] = useState<Tab>('encode')
  const [encodeInput, setEncodeInput] = useState('')
  const [encodeMode, setEncodeMode] = useState<'encode' | 'decode'>('encode')
  const [urlInput, setUrlInput] = useState('')
  const [copied, setCopied] = useState(false)

  const encodeResult = useMemo(() => {
    if (!encodeInput.trim()) return { result: '', error: '' }
    if (encodeMode === 'encode') return { result: encodeURIComponent(encodeInput), error: '' }
    return safeDecode(encodeInput)
  }, [encodeInput, encodeMode])

  const parsed = useMemo(() => urlInput.trim() ? parseUrl(urlInput.trim()) : null, [urlInput])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>URL Encoder / Decoder</h1>
      <p className={styles.description}>Encode or decode URI components and parse URL structure.</p>

      <div className={styles.tabs} role="tablist">
        <button className={`${styles.tab}${tab === 'encode' ? ` ${styles.tabActive}` : ''}`}
          onClick={() => setTab('encode')} role="tab" aria-selected={tab === 'encode'}>
          Encode / Decode
        </button>
        <button className={`${styles.tab}${tab === 'parse' ? ` ${styles.tabActive}` : ''}`}
          onClick={() => setTab('parse')} role="tab" aria-selected={tab === 'parse'}>
          Parse URL
        </button>
      </div>

      {tab === 'encode' ? (
        <div className={styles.encodeSection}>
          <div className={styles.modeRow}>
            <div className={styles.modeToggle} role="group" aria-label="Operation">
              <button className={`${styles.modeBtn}${encodeMode === 'encode' ? ` ${styles.modeBtnActive}` : ''}`}
                onClick={() => setEncodeMode('encode')} aria-pressed={encodeMode === 'encode'}>Encode</button>
              <button className={`${styles.modeBtn}${encodeMode === 'decode' ? ` ${styles.modeBtnActive}` : ''}`}
                onClick={() => setEncodeMode('decode')} aria-pressed={encodeMode === 'decode'}>Decode</button>
            </div>
          </div>

          <div className={styles.panels}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>{encodeMode === 'encode' ? 'Plain text' : 'Encoded URL'}</span>
              </div>
              <textarea
                className={styles.codeArea}
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
                placeholder={encodeMode === 'encode' ? 'hello world & more?' : 'hello%20world%20%26%20more%3F'}
                spellCheck={false}
                aria-label="Input"
              />
            </div>

            <div className={styles.arrowCol}>
              <span className={styles.arrowIcon} aria-hidden="true">→</span>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>{encodeMode === 'encode' ? 'Encoded URL' : 'Plain text'}</span>
                {encodeResult.result && (
                  <button className={styles.copyBtn} onClick={() => copy(encodeResult.result)}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <pre className={styles.codeOutput} aria-live="polite">
                {encodeResult.error
                  ? <span className={styles.error}>{encodeResult.error}</span>
                  : encodeResult.result || <span className={styles.placeholder}>Result appears here</span>
                }
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.parseSection}>
          <div className={styles.urlInputRow}>
            <input
              className={styles.urlInput}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/path?key=value&foo=bar#section"
              spellCheck={false}
              aria-label="URL to parse"
            />
          </div>

          {urlInput && !parsed && (
            <p className={styles.error}>Could not parse URL</p>
          )}

          {parsed && (
            <table className={styles.table} aria-label="Parsed URL components">
              <tbody>
                {[
                  ['Protocol', parsed.protocol],
                  ['Hostname', parsed.hostname],
                  parsed.port  ? ['Port', parsed.port]  : null,
                  parsed.username ? ['Username', parsed.username] : null,
                  parsed.password ? ['Password', parsed.password] : null,
                  ['Path', parsed.pathname],
                  parsed.hash  ? ['Hash', parsed.hash]  : null,
                ].filter((x): x is [string, string] => x !== null).map(([k, v]) => (
                  <tr key={k} className={styles.tableRow}>
                    <td className={styles.tableKey}>{k}</td>
                    <td className={styles.tableVal}><code>{v}</code></td>
                  </tr>
                ))}
                {parsed.params.length > 0 && (
                  <tr className={styles.tableRow}>
                    <td className={styles.tableKey} style={{ verticalAlign: 'top' }}>Query params</td>
                    <td className={styles.tableVal}>
                      <table className={styles.paramsTable}>
                        <thead>
                          <tr>
                            <th className={styles.paramHeader}>Key</th>
                            <th className={styles.paramHeader}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.params.map(([k, v], i) => (
                            <tr key={i} className={styles.paramRow}>
                              <td className={styles.paramKey}>{k}</td>
                              <td className={styles.paramVal}>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
