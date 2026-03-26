const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export function toDateKey(date) {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function getMondayOfDate(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay()
  const offset = jsDay === 0 ? -6 : 1 - jsDay
  d.setDate(d.getDate() + offset)
  return d
}

/** Get the date key for a given day index (0=Mon … 6=Sun) relative to a Monday. */
export function getDayKey(monday, dayIndex) {
  const d = new Date(monday)
  d.setDate(d.getDate() + dayIndex)
  return toDateKey(d)
}

export function getDayDateLabel(monday, dayIndex) {
  const d = new Date(monday)
  d.setDate(d.getDate() + dayIndex)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** Returns "Mar 23 – Mar 29" style label for a week starting at the given Monday. */
export function getWeekRangeLabel(monday) {
  const mon = new Date(monday)
  const sun = new Date(monday)
  sun.setDate(sun.getDate() + 6)
  return `${MONTHS[mon.getMonth()]} ${mon.getDate()} – ${MONTHS[sun.getMonth()]} ${sun.getDate()}`
}

/** Returns 0–6 (Mon–Sun) for today. */
export function getCurrentDayIndex() {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}
