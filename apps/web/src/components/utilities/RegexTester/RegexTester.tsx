import { useState, useMemo } from 'react'
import styles from './RegexTester.module.scss'

type Flag = 'g' | 'i' | 'm' | 's'
const ALL_FLAGS: Flag[] = ['g', 'i', 'm', 's']
const FLAG_LABELS: Record<Flag, string> = { g: 'global', i: 'case insensitive', m: 'multiline', s: 'dot-all' }

interface MatchResult {
  fullMatch: string
  groups: (string | undefined)[]
  index: number
  end: number
}

function buildRegex(pattern: string, flags: Set<Flag>): RegExp | null {
  try {
    const f = [...flags].join('')
    // Always include 'g' internally so matchAll works; user flag set controls display label
    return new RegExp(pattern, flags.has('g') ? f : f + 'g')
  } catch {
    return null
  }
}

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState<Set<Flag>>(new Set(['g']))
  const [testStr, setTestStr] = useState('')
  const [replaceVal, setReplaceVal] = useState('')
  const [mode, setMode] = useState<'test' | 'replace'>('test')

  const toggleFlag = (f: Flag) =>
    setFlags((prev) => { const next = new Set(prev); next.has(f) ? next.delete(f) : next.add(f); return next })

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null }
    const r = buildRegex(pattern, flags)
    return r ? { regex: r, error: null } : { regex: null, error: 'Invalid regular expression' }
  }, [pattern, flags])

  const matches = useMemo((): MatchResult[] => {
    if (!regex || !testStr) return []
    const results: MatchResult[] = []
    for (const m of testStr.matchAll(regex)) {
      results.push({
        fullMatch: m[0],
        groups: [...m].slice(1),
        index: m.index ?? 0,
        end: (m.index ?? 0) + m[0].length,
      })
    }
    return results
  }, [regex, testStr])

  const highlighted = useMemo(() => {
    if (!matches.length || !testStr) return null
    const parts: Array<{ text: string; isMatch: boolean }> = []
    let cursor = 0
    for (const m of matches) {
      if (m.index > cursor) parts.push({ text: testStr.slice(cursor, m.index), isMatch: false })
      parts.push({ text: m.fullMatch, isMatch: true })
      cursor = m.end
    }
    if (cursor < testStr.length) parts.push({ text: testStr.slice(cursor), isMatch: false })
    return parts
  }, [matches, testStr])

  const replaceResult = useMemo(() => {
    if (!regex || !testStr || mode !== 'replace') return ''
    try { return testStr.replace(regex, replaceVal) } catch { return '' }
  }, [regex, testStr, replaceVal, mode])

  const flagStr = [...flags].join('')
  const patternDisplay = pattern ? `/${pattern}/${flagStr}` : ''

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Regex Tester</h1>
      <p className={styles.description}>Test regular expressions with live match highlighting.</p>

      {/* Pattern row */}
      <div className={styles.patternRow}>
        <div className={`${styles.patternWrap}${error ? ` ${styles.patternError}` : ''}`}>
          <span className={styles.slash}>/</span>
          <input
            className={styles.patternInput}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="pattern"
            spellCheck={false}
            aria-label="Regex pattern"
            aria-invalid={!!error}
          />
          <span className={styles.slash}>/</span>
          <span className={styles.flagDisplay}>{flagStr}</span>
        </div>
        <div className={styles.flagToggles} role="group" aria-label="Flags">
          {ALL_FLAGS.map((f) => (
            <button
              key={f}
              className={`${styles.flagBtn}${flags.has(f) ? ` ${styles.flagBtnOn}` : ''}`}
              onClick={() => toggleFlag(f)}
              aria-pressed={flags.has(f)}
              aria-label={FLAG_LABELS[f]}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.modeToggle} role="group" aria-label="Mode">
          <button className={`${styles.modeBtn}${mode === 'test' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => setMode('test')} aria-pressed={mode === 'test'}>Test</button>
          <button className={`${styles.modeBtn}${mode === 'replace' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => setMode('replace')} aria-pressed={mode === 'replace'}>Replace</button>
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.body}>
        {/* Test string */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Test string</span>
            {matches.length > 0 && (
              <span className={styles.matchCount}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            )}
          </div>
          <textarea
            className={styles.codeArea}
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            placeholder="Paste text to test against…"
            spellCheck={false}
            aria-label="Test string"
          />
        </div>

        {/* Highlighted output or replace input+output */}
        {mode === 'test' ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>Highlighted matches</span>
            </div>
            <pre className={styles.highlightArea} aria-live="polite">
              {highlighted
                ? highlighted.map((p, i) =>
                    p.isMatch
                      ? <mark key={i} className={styles.mark}>{p.text}</mark>
                      : <span key={i}>{p.text}</span>
                  )
                : <span className={styles.placeholder}>{testStr || 'Matches will be highlighted here'}</span>
              }
            </pre>
          </div>
        ) : (
          <div className={styles.replaceCol}>
            <div className={styles.panel} style={{ flex: '0 0 auto' }}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>Replacement</span>
                <span className={styles.hint}>Use $1, $2 for capture groups</span>
              </div>
              <input
                className={styles.replaceInput}
                value={replaceVal}
                onChange={(e) => setReplaceVal(e.target.value)}
                placeholder="replacement string"
                spellCheck={false}
                aria-label="Replacement string"
              />
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelLabel}>Result</span>
              </div>
              <pre className={styles.highlightArea} aria-live="polite">
                {replaceResult || <span className={styles.placeholder}>Result appears here</span>}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Match list */}
      {matches.length > 0 && mode === 'test' && (
        <div className={styles.matchList}>
          <p className={styles.panelLabel}>Matches</p>
          {matches.map((m, i) => (
            <div key={i} className={styles.matchItem}>
              <span className={styles.matchIndex}>#{i + 1}</span>
              <code className={styles.matchText}>{JSON.stringify(m.fullMatch)}</code>
              <span className={styles.matchPos}>index {m.index}–{m.end}</span>
              {m.groups.filter(Boolean).length > 0 && (
                <span className={styles.matchGroups}>
                  groups: {m.groups.map((g, gi) => (
                    <code key={gi} className={styles.group}>{g ?? 'undefined'}</code>
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {pattern && !error && testStr && matches.length === 0 && (
        <p className={styles.noMatch}>No matches found for <code>{patternDisplay}</code></p>
      )}
    </div>
  )
}
