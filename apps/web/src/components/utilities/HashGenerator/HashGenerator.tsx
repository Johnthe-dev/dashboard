import { useState, useCallback } from 'react'
import styles from './HashGenerator.module.scss'

// Pure-JS MD5 (Web Crypto does not support MD5)
function md5(str: string): string {
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21]
  const K = Array.from({ length: 64 }, (_, i) => (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0)

  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) bytes.push((c >> 6) | 0xc0, (c & 0x3f) | 0x80)
    else bytes.push((c >> 12) | 0xe0, ((c >> 6) & 0x3f) | 0x80, (c & 0x3f) | 0x80)
  }
  const bitLen = bytes.length * 8
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  // Append bit-length as two 32-bit LE words (64-bit total).
  // Cannot use a single loop with >>> (i * 8) because >>> 32 wraps to >>> 0 in JS.
  for (let i = 0; i < 4; i++) bytes.push((bitLen >>> (i * 8)) & 0xff)
  for (let i = 0; i < 4; i++) bytes.push(0)

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476

  for (let blk = 0; blk < bytes.length; blk += 64) {
    const M = Array.from({ length: 16 }, (_, j) =>
      bytes[blk + j * 4] | (bytes[blk + j * 4 + 1] << 8) | (bytes[blk + j * 4 + 2] << 16) | (bytes[blk + j * 4 + 3] << 24)
    )
    let A = a0, B = b0, C = c0, D = d0
    for (let i = 0; i < 64; i++) {
      let F: number, g: number
      if (i < 16)      { F = (B & C) | (~B & D); g = i }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16 }
      else if (i < 48) { F = B ^ C ^ D;           g = (3 * i + 5) % 16 }
      else             { F = C ^ (B | ~D);         g = (7 * i) % 16 }
      F = (F + A + K[i] + M[g]) | 0
      A = D; D = C; C = B
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0
  }

  return [a0, b0, c0, d0]
    .flatMap((h) => [(h & 0xff), (h >> 8 & 0xff), (h >> 16 & 0xff), (h >>> 24 & 0xff)])
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'] as const
type Algorithm = (typeof ALGORITHMS)[number]

type Hashes = Record<Algorithm, string>

export function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Partial<Hashes>>({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<Algorithm | null>(null)
  const [uppercase, setUppercase] = useState(false)

  const compute = useCallback(async () => {
    if (!input) return
    setLoading(true)
    const [sha1, sha256, sha512] = await Promise.all([
      sha('SHA-1', input),
      sha('SHA-256', input),
      sha('SHA-512', input),
    ])
    setHashes({ 'MD5': md5(input), 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-512': sha512 })
    setLoading(false)
  }, [input])

  const display = (h: string) => uppercase ? h.toUpperCase() : h

  const copy = async (alg: Algorithm, value: string) => {
    await navigator.clipboard.writeText(display(value))
    setCopied(alg)
    setTimeout(() => setCopied(null), 1500)
  }

  const hasResults = Object.keys(hashes).length > 0

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Hash Generator</h1>
      <p className={styles.description}>Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text.</p>

      <div className={styles.inputSection}>
        <textarea
          className={styles.textArea}
          value={input}
          onChange={(e) => { setInput(e.target.value); setHashes({}) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) compute() }}
          placeholder="Type or paste text to hash…"
          spellCheck={false}
          rows={4}
          aria-label="Text to hash"
        />
        <div className={styles.inputActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={compute}
            disabled={!input.trim() || loading}
            aria-busy={loading}
          >
            {loading ? 'Computing…' : 'Generate hashes'}
          </button>
          <label className={styles.checkLabel}>
            <input type="checkbox" className={styles.check} checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)} />
            Uppercase
          </label>
          {hasResults && (
            <button className={styles.btnGhost} onClick={() => { setInput(''); setHashes({}) }}>Clear</button>
          )}
        </div>
      </div>

      {hasResults && (
        <table className={styles.table} aria-label="Hash results">
          <thead>
            <tr>
              <th className={styles.thAlg}>Algorithm</th>
              <th className={styles.thHash}>Hash</th>
              <th className={styles.thCopy}></th>
            </tr>
          </thead>
          <tbody>
            {ALGORITHMS.map((alg) => {
              const value = hashes[alg]
              if (!value) return null
              return (
                <tr key={alg} className={styles.row}>
                  <td className={styles.algCell}>{alg}</td>
                  <td className={styles.hashCell}>
                    <code className={styles.hash}>{display(value)}</code>
                  </td>
                  <td className={styles.copyCell}>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copy(alg, value)}
                      aria-label={`Copy ${alg} hash`}
                    >
                      {copied === alg ? 'Copied!' : 'Copy'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {!hasResults && input && (
        <p className={styles.hint}>Press <kbd className={styles.kbd}>Ctrl+Enter</kbd> or click Generate.</p>
      )}
    </div>
  )
}
