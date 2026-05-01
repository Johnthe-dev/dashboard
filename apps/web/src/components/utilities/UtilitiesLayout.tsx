import { Link, Outlet } from '@tanstack/react-router'
import styles from './UtilitiesLayout.module.scss'

const TOOLS = [
  { to: '/utilities/json',   label: 'JSON' },
  { to: '/utilities/jwt',    label: 'JWT' },
  { to: '/utilities/base64', label: 'Base64' },
  { to: '/utilities/epoch',  label: 'Epoch' },
  { to: '/utilities/regex',  label: 'Regex' },
  { to: '/utilities/diff',   label: 'Diff' },
  { to: '/utilities/url',    label: 'URL' },
  { to: '/utilities/hash',   label: 'Hash' },
] as const

export function UtilitiesLayout() {
  return (
    <div className={styles.root}>
      <nav className={styles.nav} aria-label="Dev tools navigation">
        <Link to="/" className={styles.backLink}>← Focal</Link>
        <span className={styles.title}>Dev Tools</span>
        <div className={styles.tabs} role="tablist">
          {TOOLS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={styles.tab}
              activeProps={{ className: `${styles.tab} ${styles.tabActive}` }}
              role="tab"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
