function Sparkline({ values }) {
  if (!values || values.length < 2) return null
  const max = Math.max(...values, 1)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 100 - Math.min(100, (v / max) * 100)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="eden-stat-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={points} fill="none" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function EdenStatCard({ label, value, subValue, percent, history, large }) {
  return (
    <div className={`eden-stat-card${large ? ' is-large' : ''}`}>
      <span className="eden-stat-label">{label}</span>
      <span className="eden-stat-value">{value}</span>
      {subValue && <span className="eden-stat-sub">{subValue}</span>}
      {percent != null && (
        <div className="eden-stat-bar">
          <div className="eden-stat-bar-fill" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </div>
      )}
      {history && <Sparkline values={history} />}
    </div>
  )
}

export default EdenStatCard
