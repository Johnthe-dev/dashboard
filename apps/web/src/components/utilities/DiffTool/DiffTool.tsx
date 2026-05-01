import { useState, useMemo } from 'react'
import styles from './DiffTool.module.scss'

type DiffMode = 'text' | 'json'
type LineType = 'equal' | 'added' | 'removed'

interface DiffLine {
  type: LineType
  value: string
  leftNo: number | null
  rightNo: number | null
}

function computeDiff(leftText: string, rightText: string): DiffLine[] {
  const left = leftText.split('\n')
  const right = rightText.split('\n')
  const m = left.length
  const n = right.length

  // Build LCS table (bounded to prevent quadratic blowup on very large inputs)
  const MAX = 3000
  if (m > MAX || n > MAX) {
    return [{ type: 'added', value: `[Input too large — limit ${MAX} lines per side]`, leftNo: null, rightNo: null }]
  }

  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = left[i - 1] === right[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])

  // Iterative backtrack
  const raw: Array<{ type: LineType; value: string }> = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      raw.push({ type: 'equal', value: left[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ type: 'added', value: right[j - 1] })
      j--
    } else {
      raw.push({ type: 'removed', value: left[i - 1] })
      i--
    }
  }
  raw.reverse()

  // Attach line numbers
  let leftNo = 1, rightNo = 1
  return raw.map((l) => {
    const line: DiffLine = {
      ...l,
      leftNo:  l.type !== 'added'   ? leftNo  : null,
      rightNo: l.type !== 'removed' ? rightNo : null,
    }
    if (l.type !== 'added')   leftNo++
    if (l.type !== 'removed') rightNo++
    return line
  })
}

function prettyJson(text: string): string {
  return JSON.stringify(JSON.parse(text), null, 2)
}

export function DiffTool() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState<DiffMode>('text')
  const [jsonError, setJsonError] = useState('')

  const diff = useMemo((): DiffLine[] | null => {
    if (!left && !right) return null
    setJsonError('')
    if (mode === 'json') {
      try {
        return computeDiff(prettyJson(left || '{}'), prettyJson(right || '{}'))
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
        return null
      }
    }
    return computeDiff(left, right)
  }, [left, right, mode])

  const stats = useMemo(() => {
    if (!diff) return null
    return {
      added:   diff.filter((l) => l.type === 'added').length,
      removed: diff.filter((l) => l.type === 'removed').length,
      equal:   diff.filter((l) => l.type === 'equal').length,
    }
  }, [diff])

  const swap = () => { setLeft(right); setRight(left) }

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Diff Tool</h1>
      <p className={styles.description}>Compare two blocks of text or JSON line by line.</p>

      <div className={styles.toolbar}>
        <div className={styles.modeToggle} role="group" aria-label="Diff mode">
          <button className={`${styles.modeBtn}${mode === 'text' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => setMode('text')} aria-pressed={mode === 'text'}>Text</button>
          <button className={`${styles.modeBtn}${mode === 'json' ? ` ${styles.modeBtnActive}` : ''}`}
            onClick={() => setMode('json')} aria-pressed={mode === 'json'}>JSON</button>
        </div>
        <button className={styles.swapBtn} onClick={swap} aria-label="Swap left and right">⇄ Swap</button>
        {stats && (
          <div className={styles.stats}>
            {stats.added > 0 && <span className={styles.statAdded}>+{stats.added}</span>}
            {stats.removed > 0 && <span className={styles.statRemoved}>−{stats.removed}</span>}
            <span className={styles.statEqual}>{stats.equal} unchanged</span>
          </div>
        )}
      </div>

      {jsonError && <p className={styles.errorMsg} role="alert">{jsonError}</p>}

      <div className={styles.inputs}>
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}><span className={styles.panelLabel}>Original</span></div>
          <textarea
            className={styles.codeArea}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder={mode === 'json' ? '{ "original": "JSON" }' : 'Original text…'}
            spellCheck={false}
            aria-label="Original text"
          />
        </div>
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}><span className={styles.panelLabel}>Modified</span></div>
          <textarea
            className={styles.codeArea}
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder={mode === 'json' ? '{ "modified": "JSON" }' : 'Modified text…'}
            spellCheck={false}
            aria-label="Modified text"
          />
        </div>
      </div>

      {diff && (
        <div className={styles.diffOutput} role="region" aria-label="Diff result">
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Diff</span>
          </div>
          <div className={styles.diffLines}>
            {diff.map((line, i) => (
              <div
                key={i}
                className={`${styles.diffLine} ${
                  line.type === 'added' ? styles.lineAdded :
                  line.type === 'removed' ? styles.lineRemoved : styles.lineEqual
                }`}
              >
                <span className={styles.lineNoLeft}>{line.leftNo ?? ''}</span>
                <span className={styles.lineNoRight}>{line.rightNo ?? ''}</span>
                <span className={styles.linePrefix} aria-hidden="true">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                </span>
                <span className={styles.lineText}>{line.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
