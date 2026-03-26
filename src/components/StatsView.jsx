import { useEffect, useRef, useState } from "react"

function CompletionChart({ week }) {
  const width = 320, height = 200, barGap = 6
  const barWidth = (width - barGap * (week.length + 1)) / week.length

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart" style={{ height: 200 }}>
        {week.map((day, i) => {
          const x = barGap + i * (barWidth + barGap)
          const barH = height - 40
          const y = 10
          return (
            <g key={day.day}>
              <rect x={x} y={y} width={barWidth} height={barH} rx={6}
                className={day.completed ? "chart-bar-done" : "chart-bar-empty"} />
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle"
                className="chart-axis-label">{day.day.slice(0, 3)}</text>
            </g>
          )
        })}
      </svg>
      <div className="chart-legend row gap-8" style={{ marginTop: 8 }}>
        <span className="legend-item"><span className="legend-dot done" /> Completed</span>
        <span className="legend-item"><span className="legend-dot empty" /> Not done</span>
      </div>
    </div>
  )
}

function StatsLineChart({ week }) {
  const width = 320, height = 220, padL = 38, padR = 12, padT = 16, padB = 30
  const chartW = width - padL - padR, chartH = height - padT - padB
  const maxY = 5
  const days = week.filter((d) => d.energy !== "" || d.rpe !== "" || d.soreness !== "")

  if (!days.length) return <div className="empty-chart">No data yet — log energy, RPE or soreness on the Home tab.</div>

  const toPoint = (i, val) => {
    const x = padL + (days.length === 1 ? chartW / 2 : (i / (days.length - 1)) * chartW)
    const y = padT + chartH - ((val / maxY) * chartH)
    return [x, y]
  }
  const linePath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")

  const energyPts = days.map((d, i) => toPoint(i, Number(d.energy || 0)))
  const rpePts = days.map((d, i) => toPoint(i, Number(d.rpe || 0)))
  const sorenessPts = days.map((d, i) => toPoint(i, Number(d.soreness || 0)))

  const yTicks = [0, 1, 2, 3, 4, 5]

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart" style={{ height: 220 }}>
        {/* Y-axis line */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} className="chart-axis-line" />
        {/* X-axis line */}
        <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} className="chart-axis-line" />
        {/* Y grid + labels */}
        {yTicks.map((v) => {
          const y = padT + chartH - ((v / maxY) * chartH)
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={padL + chartW} y2={y} className="chart-grid" />
              <text x={padL - 6} y={y + 3} textAnchor="end" className="chart-axis-label">{v}</text>
            </g>
          )
        })}
        {/* Data lines */}
        <path d={linePath(energyPts)} fill="none" className="chart-line-energy" />
        <path d={linePath(rpePts)} fill="none" className="chart-line-rpe" />
        <path d={linePath(sorenessPts)} fill="none" className="chart-line-soreness" />
        {/* X labels */}
        {days.map((d, i) => (
          <text key={d.day} x={toPoint(i, 0)[0]} y={height - 4} textAnchor="middle"
            className="chart-axis-label">{d.day.slice(0, 3)}</text>
        ))}
      </svg>
      <div className="chart-legend row gap-8" style={{ marginTop: 8, flexWrap: "wrap" }}>
        <span className="legend-item"><span className="legend-dot energy" /> Energy</span>
        <span className="legend-item"><span className="legend-dot rpe" /> RPE</span>
        <span className="legend-item"><span className="legend-dot soreness" /> Soreness</span>
      </div>
    </div>
  )
}

function weeklyAvgNum(week, field) {
  const vals = week.map((d) => Number(d[field] || 0)).filter((v) => v > 0)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function weeklyAvg(week, field, max) {
  const v = weeklyAvgNum(week, field)
  if (v === null) return "–"
  return v.toFixed(1) + "/" + max
}

function LiquidCard({ label, week, field, max }) {
  const avg = weeklyAvgNum(week, field)
  const pct = avg !== null ? Math.min((avg / max) * 100, 100) : 0
  const tiltRef = useRef(0)
  const rafRef = useRef(null)
  const [tilt, setTilt] = useState(0)

  useEffect(() => {
    let lastY = 0
    let velocity = 0

    const onScroll = () => {
      const el = document.querySelector(".main-area")
      if (!el) return
      const y = el.scrollTop
      velocity = Math.max(-18, Math.min(18, (y - lastY) * 1.2))
      lastY = y
      tiltRef.current = velocity
      setTilt(velocity)
    }

    const decay = () => {
      tiltRef.current *= 0.88
      if (Math.abs(tiltRef.current) < 0.3) tiltRef.current = 0
      setTilt(tiltRef.current)
      rafRef.current = requestAnimationFrame(decay)
    }

    const el = document.querySelector(".main-area")
    if (el) el.addEventListener("scroll", onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(decay)
    return () => {
      if (el) el.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const waveY = 100 - pct

  return (
    <div className="card liquid-card">
      <svg className="liquid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <clipPath id={`lc-${field}`}>
            <rect x="0" y="0" width="100" height="100" rx="16" />
          </clipPath>
        </defs>
        <g clipPath={`url(#lc-${field})`}>
          <path
            d={`M0 ${waveY + tilt * 0.4} Q25 ${waveY - 3 + tilt * 0.7} 50 ${waveY + tilt * 0.3} T100 ${waveY - tilt * 0.4} V100 H0 Z`}
            className="liquid-fill"
          />
          <path
            d={`M0 ${waveY + 1.5 + tilt * 0.3} Q30 ${waveY - 1 + tilt * 0.5} 55 ${waveY + 1 + tilt * 0.2} T100 ${waveY + 1 - tilt * 0.3} V100 H0 Z`}
            className="liquid-fill-highlight"
          />
        </g>
      </svg>
      <div className="liquid-content">
        <div className="small muted">{label}</div>
        <div className="metric">{weeklyAvg(week, field, max)}</div>
      </div>
    </div>
  )
}

export default function StatsView({ stats, recoveryScore, streak, week }) {
  const [tab, setTab] = useState("completed")

  return (
    <div className="stack-20">
      <div className="card pad stack-12">
        <h2>Progress</h2>
        <div className="stats-tabs">
          <button className={`stats-tab${tab === "completed" ? " active" : ""}`}
            onClick={() => setTab("completed")}>Completed</button>
          <button className={`stats-tab${tab === "stats" ? " active" : ""}`}
            onClick={() => setTab("stats")}>Stats</button>
        </div>
        {tab === "completed" && <CompletionChart week={week} />}
        {tab === "stats" && <StatsLineChart week={week} />}
      </div>
      <div className="grid-two">
        <LiquidCard label="Avg Energy" week={week} field="energy" max={5} />
        <LiquidCard label="Avg RPE" week={week} field="rpe" max={5} />
        <LiquidCard label="Avg Soreness" week={week} field="soreness" max={5} />
        <div className="card pad compact streak-card"><div className="small muted">Streak</div><div className="metric">🔥 {streak}</div></div>
      </div>
    </div>
  )
}
