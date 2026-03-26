import { DEFAULT_SCHEDULE } from "../data/weekTemplate"

export function defaultDayEntry(scheduleSlot) {
  if (scheduleSlot && scheduleSlot.split) {
    return {
      split: true,
      amWorkout: scheduleSlot.amWorkout || "Workout",
      amType: scheduleSlot.amType || "gym",
      amCompleted: false,
      pmWorkout: scheduleSlot.pmWorkout || "Workout",
      pmType: scheduleSlot.pmType || "gym",
      pmCompleted: false,
      energy: "",
      duration: "",
      notes: "",
      mealsOnTrack: false,
      hydration: false,
      sleep: false,
      rpe: "",
      soreness: "",
    }
  }
  return {
    split: false,
    workout: scheduleSlot?.workout || "Rest",
    type: scheduleSlot?.type || "rest",
    completed: false,
    energy: "",
    duration: "",
    notes: "",
    mealsOnTrack: false,
    hydration: false,
    sleep: false,
    rpe: "",
    soreness: "",
  }
}

export function isDayCompleted(day) {
  if (!day) return false
  if (day.split) return Boolean(day.amCompleted && day.pmCompleted)
  return Boolean(day.completed)
}

export function defaultData() {
  return {
    _v: 4,
    profile: { name: "", goal: "performance" },
    defaultSchedule: DEFAULT_SCHEDULE.map((s) => ({ ...s })),
    weekSchedules: {},
    metrics: { weight: "", restingHeartRate: "", sleepHours: "", badmintonNotes: "" },
    days: {},
  }
}

/** Get the effective schedule for a week. Returns custom if exists, otherwise defaultSchedule. */
export function getWeekSchedule(data, mondayKey) {
  if (data.weekSchedules && data.weekSchedules[mondayKey]) {
    return data.weekSchedules[mondayKey]
  }
  return data.defaultSchedule
}

function sanitizeDayEntry(raw) {
  if (!raw || typeof raw !== "object") return null
  const shared = {
    energy: raw.energy != null ? String(raw.energy) : "",
    duration: typeof raw.duration === "string" ? raw.duration : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    mealsOnTrack: Boolean(raw.mealsOnTrack),
    hydration: Boolean(raw.hydration),
    sleep: Boolean(raw.sleep),
    rpe: raw.rpe != null ? String(raw.rpe) : "",
    soreness: raw.soreness != null ? String(raw.soreness) : "",
    matchDay: Boolean(raw.matchDay),
  }
  if (raw.split) {
    return {
      split: true,
      amWorkout: typeof raw.amWorkout === "string" ? raw.amWorkout : "Workout",
      amType: typeof raw.amType === "string" ? raw.amType : "gym",
      amCompleted: Boolean(raw.amCompleted),
      pmWorkout: typeof raw.pmWorkout === "string" ? raw.pmWorkout : "Workout",
      pmType: typeof raw.pmType === "string" ? raw.pmType : "gym",
      pmCompleted: Boolean(raw.pmCompleted),
      ...shared,
    }
  }
  return {
    split: false,
    workout: typeof raw.workout === "string" ? raw.workout : "Rest",
    type: typeof raw.type === "string" ? raw.type : "rest",
    completed: Boolean(raw.completed),
    ...shared,
  }
}

function sanitizeScheduleSlot(raw, fallback) {
  if (!raw || typeof raw !== "object") return { ...fallback }
  const label = typeof raw.label === "string" ? raw.label : fallback.label
  if (raw.split) {
    return {
      label,
      split: true,
      amWorkout: typeof raw.amWorkout === "string" ? raw.amWorkout : "Workout",
      amType: typeof raw.amType === "string" ? raw.amType : "gym",
      pmWorkout: typeof raw.pmWorkout === "string" ? raw.pmWorkout : "Workout",
      pmType: typeof raw.pmType === "string" ? raw.pmType : "gym",
    }
  }
  return {
    label,
    split: false,
    workout: typeof raw.workout === "string" ? raw.workout : fallback.workout,
    type: typeof raw.type === "string" ? raw.type : fallback.type,
  }
}

export function sanitizeData(raw) {
  const base = defaultData()
  if (!raw || typeof raw !== "object") return base

  const profile = {
    name: raw.profile?.name ?? base.profile.name,
    goal: raw.profile?.goal ?? base.profile.goal,
  }
  const metrics = {
    weight: raw.metrics?.weight ?? base.metrics.weight,
    restingHeartRate: raw.metrics?.restingHeartRate ?? base.metrics.restingHeartRate,
    sleepHours: raw.metrics?.sleepHours ?? base.metrics.sleepHours,
    badmintonNotes: raw.metrics?.badmintonNotes ?? base.metrics.badmintonNotes,
  }

  // Migrate from v1/v2 — start fresh, preserve profile + metrics only
  if (!raw._v || raw._v < 3) {
    return { ...base, profile, metrics }
  }

  // Migrate from v3 (schedule → defaultSchedule)
  if (raw._v === 3) {
    const defaultSchedule = Array.isArray(raw.schedule) && raw.schedule.length === 7
      ? raw.schedule.map((s, i) => sanitizeScheduleSlot(s, DEFAULT_SCHEDULE[i]))
      : base.defaultSchedule
    const days = {}
    if (raw.days && typeof raw.days === "object") {
      for (const [key, entry] of Object.entries(raw.days)) {
        const sanitized = sanitizeDayEntry(entry)
        if (sanitized) days[key] = sanitized
      }
    }
    return { ...base, profile, metrics, defaultSchedule, days }
  }

  // v4: sanitize defaultSchedule + weekSchedules + days
  const defaultSchedule = Array.isArray(raw.defaultSchedule) && raw.defaultSchedule.length === 7
    ? raw.defaultSchedule.map((s, i) => sanitizeScheduleSlot(s, DEFAULT_SCHEDULE[i]))
    : base.defaultSchedule

  const weekSchedules = {}
  if (raw.weekSchedules && typeof raw.weekSchedules === "object") {
    for (const [mondayKey, ws] of Object.entries(raw.weekSchedules)) {
      if (Array.isArray(ws) && ws.length === 7) {
        weekSchedules[mondayKey] = ws.map((s, i) => sanitizeScheduleSlot(s, DEFAULT_SCHEDULE[i]))
      }
    }
  }

  const days = {}
  if (raw.days && typeof raw.days === "object") {
    for (const [key, entry] of Object.entries(raw.days)) {
      const sanitized = sanitizeDayEntry(entry)
      if (sanitized) days[key] = sanitized
    }
  }

  return { ...base, profile, metrics, defaultSchedule, weekSchedules, days }
}
