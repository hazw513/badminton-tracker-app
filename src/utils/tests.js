import { DAY_LABELS, DEFAULT_SCHEDULE } from "../data/weekTemplate"
import { DIET_GUIDANCE } from "../data/dietGuidance"
import { GYM_WORKOUTS } from "../data/gymWorkouts"
import { getDayKey, getCurrentDayIndex, getMondayOfDate, toDateKey } from "./dateHelpers"
import { defaultDayEntry, getWeekSchedule, isDayCompleted, sanitizeData } from "./sanitizers"

export function runSelfTests() {
  // Schedule structure
  console.assert(DAY_LABELS.length === 7, "Should have 7 day labels")
  console.assert(DEFAULT_SCHEDULE.length === 7, "Schedule should have 7 slots")
  console.assert(DAY_LABELS[0] === "Monday", "First day should be Monday")
  console.assert(DAY_LABELS[6] === "Sunday", "Last day should be Sunday")

  // Date helpers
  const dayIdx = getCurrentDayIndex()
  console.assert(dayIdx >= 0 && dayIdx <= 6, "Current day index should be 0-6")

  const mon = getMondayOfDate(new Date())
  const key = getDayKey(mon, 0)
  console.assert(typeof key === "string" && key.length === 10, "Day key should be YYYY-MM-DD")

  // Day entry defaults — non-split
  const nonSplit = defaultDayEntry(DEFAULT_SCHEDULE[0])
  console.assert(nonSplit.split === false, "Monday should not be split")
  console.assert(nonSplit.workout === "Lower Body + Core", "Monday workout should match schedule")
  console.assert(nonSplit.completed === false, "Default entry should not be completed")

  // Day entry defaults — split
  const split = defaultDayEntry(DEFAULT_SCHEDULE[1])
  console.assert(split.split === true, "Tuesday should be split")
  console.assert(split.amCompleted === false, "Default AM should not be completed")
  console.assert(split.pmCompleted === false, "Default PM should not be completed")

  // isDayCompleted
  console.assert(isDayCompleted(null) === false, "Null day should not be completed")
  console.assert(isDayCompleted({ completed: true }) === true, "Non-split completed")
  console.assert(isDayCompleted({ split: true, amCompleted: true, pmCompleted: true }) === true, "Split both done")
  console.assert(isDayCompleted({ split: true, amCompleted: true, pmCompleted: false }) === false, "Split partial")

  // Sanitizer (fresh)
  const sanitized = sanitizeData(null)
  console.assert(typeof sanitized.days === "object", "Sanitized data should have days object")
  console.assert(sanitized._v === 4, "Sanitized data should be v4")
  console.assert(Array.isArray(sanitized.defaultSchedule) && sanitized.defaultSchedule.length === 7, "Should have defaultSchedule")
  console.assert(typeof sanitized.weekSchedules === "object", "Should have weekSchedules")

  // getWeekSchedule — default
  const defSched = getWeekSchedule(sanitized, "2026-03-23")
  console.assert(defSched === sanitized.defaultSchedule, "Should return defaultSchedule when no custom")

  // getWeekSchedule — custom
  const customSched = [{ label: "Monday", split: false, workout: "Custom", type: "gym" }]
  const withCustom = { ...sanitized, weekSchedules: { "2026-03-23": customSched } }
  console.assert(getWeekSchedule(withCustom, "2026-03-23") === customSched, "Should return custom schedule")
  console.assert(getWeekSchedule(withCustom, "2026-03-30") === withCustom.defaultSchedule, "Other weeks should get default")

  // Migration from v3
  const v3Data = { _v: 3, schedule: DEFAULT_SCHEDULE.map(s => ({ ...s })), days: { "2025-01-06": { completed: true } }, profile: { name: "Test" } }
  const migrated3 = sanitizeData(v3Data)
  console.assert(migrated3._v === 4, "Migrated v3 should be v4")
  console.assert(Array.isArray(migrated3.defaultSchedule), "v3 schedule should become defaultSchedule")
  console.assert(migrated3.profile.name === "Test", "v3 migration should preserve profile")

  // Migration from v2
  const v2Data = { _v: 2, days: { "2025-01-06": { completed: true } }, profile: { name: "Test" } }
  const migrated = sanitizeData(v2Data)
  console.assert(migrated._v === 4, "Migrated data should be v4")
  console.assert(Object.keys(migrated.days).length === 0, "Migration should start fresh days")
  console.assert(migrated.profile.name === "Test", "Migration should preserve profile")

  // Data references
  console.assert(DIET_GUIDANCE.badminton !== undefined, "Diet guidance must exist for badminton")
  console.assert(GYM_WORKOUTS["Lower Body + Core"] !== undefined, "Lower Body workout should exist")
  console.assert(GYM_WORKOUTS["Upper Body + Power"] !== undefined, "Upper Body workout should exist")
}
