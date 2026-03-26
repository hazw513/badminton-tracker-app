import { useEffect, useMemo, useRef, useState } from "react"
import { DIET_GUIDANCE } from "./data/dietGuidance"
import { GYM_WORKOUTS } from "./data/gymWorkouts"
import { DAY_LABELS, DEFAULT_SCHEDULE } from "./data/weekTemplate"
import DaySelector from "./components/DaySelector"
import DietCard from "./components/DietCard"
import NotesView from "./components/NotesView"
import ProfileView from "./components/ProfileView"
import SessionCard from "./components/SessionCard"
import StatsView from "./components/StatsView"
import WorkoutModal from "./components/WorkoutModal"
import { getCurrentDayIndex, getDayDateLabel, getDayKey, getMondayOfDate, getWeekRangeLabel, parseDateKey, toDateKey } from "./utils/dateHelpers"
import { loadFromStorage, saveToStorage } from "./utils/storage"
import { defaultData, defaultDayEntry, getWeekSchedule, isDayCompleted, sanitizeData } from "./utils/sanitizers"
import { runSelfTests } from "./utils/tests"

const STORAGE_KEY = "badminton-tracker-app"
const THEME_STORAGE_KEY = "badminton-tracker-theme"
const QUOTES = [
  "Consistency beats intensity when intensity is inconsistent.",
  "Recover as seriously as you train.",
  "Sharp footwork starts with fresh legs.",
  "Fuel your sessions like they matter — because they do.",
]

export default function App() {
  const [data, setData] = useState(() => sanitizeData(loadFromStorage(STORAGE_KEY, defaultData())))
  const [themeName, setThemeName] = useState(() => loadFromStorage(THEME_STORAGE_KEY, "dark") === "light" ? "light" : "dark")
  const [saved, setSaved] = useState(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [selectedMonday, setSelectedMonday] = useState(() => toDateKey(getMondayOfDate(new Date())))
  const [selectedSlot, setSelectedSlot] = useState(() => getCurrentDayIndex())
  const [activeTab, setActiveTab] = useState("home")
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)

  useEffect(() => { runSelfTests() }, [])

  const initialMount = useRef(true)

  useEffect(() => {
    if (initialMount.current) { initialMount.current = false; return }
    saveToStorage(STORAGE_KEY, data)
    setSaved(true)
    const t = setTimeout(() => setSaved(null), 1200)
    return () => clearTimeout(t)
  }, [data])

  useEffect(() => { saveToStorage(THEME_STORAGE_KEY, themeName) }, [themeName])

  useEffect(() => {
    const i = setInterval(() => setQuoteIndex((p) => (p + 1) % QUOTES.length), 5000)
    return () => clearInterval(i)
  }, [])

  // Derived state
  const mondayDate = useMemo(() => parseDateKey(selectedMonday), [selectedMonday])
  const selectedKey = useMemo(() => getDayKey(mondayDate, selectedSlot), [mondayDate, selectedSlot])
  const weekSchedule = useMemo(() => getWeekSchedule(data, selectedMonday), [data, selectedMonday])
  const scheduleSlot = weekSchedule[selectedSlot] || DEFAULT_SCHEDULE[selectedSlot]
  const selectedDay = data.days[selectedKey] || defaultDayEntry(scheduleSlot)
  const selectedDateLabel = useMemo(() => getDayDateLabel(mondayDate, selectedSlot), [mondayDate, selectedSlot])

  const todayMonday = toDateKey(getMondayOfDate(new Date()))
  const todaySlot = getCurrentDayIndex()
  const isToday = selectedMonday === todayMonday && selectedSlot === todaySlot

  const dayType = selectedDay.split ? selectedDay.amType : selectedDay.type
  const diet = selectedDay.matchDay ? DIET_GUIDANCE.match : (DIET_GUIDANCE[dayType] || DIET_GUIDANCE.rest)
  const workoutName = selectedDay.split ? null : selectedDay.workout
  const gymWorkout = workoutName ? GYM_WORKOUTS[workoutName] : null

  // Current week's 7 days for stats
  const currentWeekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const key = getDayKey(mondayDate, i)
      const sched = weekSchedule[i] || DEFAULT_SCHEDULE[i]
      const entry = data.days[key] || defaultDayEntry(sched)
      return { ...entry, day: DAY_LABELS[i], completed: isDayCompleted(entry) }
    })
  }, [mondayDate, data.days, weekSchedule])

  const stats = useMemo(() => {
    const total = currentWeekDays.length || 1
    const completed = currentWeekDays.filter((d) => d.completed).length
    const mealWins = currentWeekDays.filter((d) => d.mealsOnTrack).length
    const hydrationWins = currentWeekDays.filter((d) => d.hydration).length
    const sleepWins = currentWeekDays.filter((d) => d.sleep).length
    const avgEnergy = (currentWeekDays.reduce((sum, d) => sum + Number(d.energy || 0), 0) / total).toFixed(1)
    return {
      completionRate: Math.round((completed / total) * 100),
      mealRate: Math.round((mealWins / total) * 100),
      hydrationRate: Math.round((hydrationWins / total) * 100),
      sleepRate: Math.round((sleepWins / total) * 100),
      avgEnergy,
    }
  }, [currentWeekDays])

  const recoveryScore = Math.round((stats.mealRate + stats.hydrationRate + stats.sleepRate) / 3)

  // Streak: consecutive completed days going backwards
  const streak = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    let count = 0
    for (let i = 0; i < 365; i++) {
      const key = toDateKey(d)
      const entry = data.days[key]
      if (entry) {
        if (isDayCompleted(entry)) count++
        else break
      }
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [data.days])

  // Navigation
  const goNext = () => {
    if (selectedSlot < 6) {
      setSelectedSlot((s) => s + 1)
    } else {
      const d = parseDateKey(selectedMonday)
      d.setDate(d.getDate() + 7)
      setSelectedMonday(toDateKey(d))
      setSelectedSlot(0)
    }
  }

  const goPrev = () => {
    if (selectedSlot > 0) {
      setSelectedSlot((s) => s - 1)
    } else {
      const d = parseDateKey(selectedMonday)
      d.setDate(d.getDate() - 7)
      setSelectedMonday(toDateKey(d))
      setSelectedSlot(6)
    }
  }

  const goToday = () => {
    setSelectedMonday(toDateKey(getMondayOfDate(new Date())))
    setSelectedSlot(getCurrentDayIndex())
  }

  const updateDay = (field, value) => {
    setData((prev) => {
      const ws = getWeekSchedule(prev, selectedMonday)
      const sched = ws[selectedSlot] || DEFAULT_SCHEDULE[selectedSlot]
      const dayEntry = prev.days[selectedKey] || defaultDayEntry(sched)
      return {
        ...prev,
        days: { ...prev.days, [selectedKey]: { ...dayEntry, [field]: value } },
      }
    })
  }

  const updateDefaultSchedule = (newSchedule) => {
    setData((prev) => ({ ...prev, defaultSchedule: newSchedule }))
  }

  const updateWeekSchedule = (mondayKey, newSchedule) => {
    setData((prev) => {
      if (newSchedule === null) {
        const { [mondayKey]: _, ...rest } = prev.weekSchedules
        return { ...prev, weekSchedules: rest }
      }
      return { ...prev, weekSchedules: { ...prev.weekSchedules, [mondayKey]: newSchedule } }
    })
  }

  const updateProfile = (key, value) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }))
  }

  const updateMetric = (key, value) => {
    setData((prev) => ({ ...prev, metrics: { ...prev.metrics, [key]: value } }))
  }

  return (
    <div className={`app-shell ${themeName === "dark" ? "theme-dark" : "theme-light"}${selectedDay.matchDay ? " match-day" : ""}`}>
      <div className="phone-frame">
        <div className="top-bar">
          <div>
            <div className="top-label">Badminton Tracker</div>
            <div className="top-day">{DAY_LABELS[selectedSlot]}</div>
            <div className="top-sub">{isToday ? `Today · ${selectedDateLabel}` : selectedDateLabel}</div>
          </div>
          <div className="row gap-8">
            <div className={saved === true ? "save-pill saved" : "save-pill"}>{saved === true ? "Saved ✓" : "Auto-saved"}</div>
          </div>
        </div>

        <main className="main-area">
          {activeTab === "home" && (
            <div className="stack-20">
              <div className="hero-card stack-14">
                <div className="quote-line">✨ {QUOTES[quoteIndex]}</div>
                <div className="row between end">
                  <div>
                    <div className="hero-label">Weekly completion</div>
                    <div className="hero-metric">{stats.completionRate}%</div>
                  </div>
                  <div className="hero-streak">
                    <div className="small subtle">Streak</div>
                    <div className="hero-streak-value">🔥 {streak}</div>
                  </div>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${stats.completionRate}%` }} /></div>
              </div>

              <DaySelector
                dayLabel={DAY_LABELS[selectedSlot]}
                dateLabel={selectedDateLabel}
                isToday={isToday}
                day={selectedDay}
                onGoToday={goToday}
                onPrev={goPrev}
                onNext={goNext}
              />

              <SessionCard
                day={selectedDay}
                onUpdate={updateDay}
                onOpenWorkout={() => setIsWorkoutModalOpen(true)}
                hasWorkoutModal={!!gymWorkout}
              />

              <DietCard diet={diet} isMatchDay={selectedDay.matchDay} />
            </div>
          )}

          {activeTab === "stats" && <StatsView stats={stats} recoveryScore={recoveryScore} streak={streak} week={currentWeekDays} />}

          {activeTab === "notes" && (
            <NotesView
              value={data.metrics.badmintonNotes}
              onChange={(value) => updateMetric("badmintonNotes", value)}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView
              profile={data.profile}
              metrics={data.metrics}
              defaultSchedule={data.defaultSchedule}
              weekSchedules={data.weekSchedules}
              onProfileChange={updateProfile}
              onMetricChange={updateMetric}
              onDefaultScheduleChange={updateDefaultSchedule}
              onWeekScheduleChange={updateWeekSchedule}
            />
          )}
        </main>

        <div className="bottom-nav">
          <button className={activeTab === "home" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("home")}>🏠<span>Home</span></button>
          <button className={activeTab === "stats" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("stats")}>📊<span>Stats</span></button>
          <button className={activeTab === "notes" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("notes")}>📝<span>Notes</span></button>
          <button className={activeTab === "profile" ? "nav-btn active" : "nav-btn"} onClick={() => setActiveTab("profile")}>👤<span>Profile</span></button>
        </div>

        <WorkoutModal open={isWorkoutModalOpen} workout={gymWorkout} onClose={() => setIsWorkoutModalOpen(false)} />
      </div>
    </div>
  )
}
