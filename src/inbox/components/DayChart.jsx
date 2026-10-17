import { useState } from 'react'
import { dayLabel, plural } from '../format'

// Two series, same unit (emails per day): thin grouped bars, sorted then read.
// Colors validated for the dark surface (dataviz validator, all checks pass).
const W = 216
const H = 64
const GAP = 2

export default function DayChart({ days }) {
  const [active, setActive] = useState(null)
  if (!days?.length) return null
  const max = Math.max(1, ...days.map((d) => Math.max(d.sorted, d.read)))
  const slot = W / days.length
  const bar = Math.max(2, (slot - GAP * 3) / 2)
  const shown = active ?? days.length - 1
  const d = days[shown]
  const y = (v) => H - Math.max(v ? 2 : 0, Math.round((v / max) * H))

  return (
    <figure className="ibx-chart">
      <figcaption className="ibx-chart-head">
        <span>Last 14 days</span>
        <span className="ibx-chart-legend">
          <span><i className="ibx-swatch ibx-swatch--sorted" />Sorted</span>
          <span><i className="ibx-swatch ibx-swatch--read" />Read</span>
        </span>
      </figcaption>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 1}`} preserveAspectRatio="none" role="img"
        aria-label={`Emails sorted and read per day for the last ${days.length} days`}
        onMouseLeave={() => setActive(null)}>
        <line x1="0" x2={W} y1={H + 0.5} y2={H + 0.5} className="ibx-chart-base" />
        {days.map((day, i) => {
          const x = i * slot + GAP
          return (
            <g key={day.day} className={i === shown ? 'is-active' : undefined}>
              {day.sorted > 0 && <rect x={x} y={y(day.sorted)} width={bar} height={H - y(day.sorted)} rx="1.5" className="ibx-bar ibx-bar--sorted" />}
              {day.read > 0 && <rect x={x + bar + GAP} y={y(day.read)} width={bar} height={H - y(day.read)} rx="1.5" className="ibx-bar ibx-bar--read" />}
              <rect x={i * slot} y="0" width={slot} height={H} fill="transparent" tabIndex={0}
                aria-label={`${dayLabel(day.day)}: ${day.sorted} sorted, ${day.read} read`}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} />
            </g>
          )
        })}
      </svg>
      <p className="ibx-chart-readout" aria-live="polite">
        <strong>{dayLabel(d.day)}</strong> {plural(d.sorted, 'sorted', 'sorted')}, {d.read} read{d.cleared ? `, ${d.cleared} archived` : ''}
      </p>
      <table className="ibx-sr">
        <caption>Emails per day</caption>
        <thead><tr><th>Day</th><th>Sorted</th><th>Read</th><th>Archived</th></tr></thead>
        <tbody>{days.map((x) => <tr key={x.day}><td>{x.day}</td><td>{x.sorted}</td><td>{x.read}</td><td>{x.cleared}</td></tr>)}</tbody>
      </table>
    </figure>
  )
}
