import { useState, useMemo } from "react"
import { WORKOUT_TYPES } from "../data/weekTemplate"
import { getMondayOfDate, getWeekRangeLabel, parseDateKey, toDateKey } from "../utils/dateHelpers"

function ScheduleEditor({ schedule, onSlotUpdate, onToggleSplit }) {
  return (
    <>
      {schedule.map((slot, index) => (
        <div key={index} className="schedule-slot stack-8">
          <div className="row between">
            <div className="schedule-day-label">{slot.label}</div>
            <label className="split-toggle">
              <input type="checkbox" checked={slot.split} onChange={() => onToggleSplit(index)} />
              <span className="small">AM / PM</span>
            </label>
          </div>
          {slot.split ? (
            <div className="stack-10">
              <div className="grid-two">
                <div>
                  <label className="field-label small">AM Workout</label>
                  <input className="input" value={slot.amWorkout} onChange={(e) => onSlotUpdate(index, { amWorkout: e.target.value })} placeholder="Workout name" />
                </div>
                <div>
                  <label className="field-label small">AM Type</label>
                  <select className="input" value={slot.amType} onChange={(e) => onSlotUpdate(index, { amType: e.target.value })}>
                    {WORKOUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-two">
                <div>
                  <label className="field-label small">PM Workout</label>
                  <input className="input" value={slot.pmWorkout} onChange={(e) => onSlotUpdate(index, { pmWorkout: e.target.value })} placeholder="Workout name" />
                </div>
                <div>
                  <label className="field-label small">PM Type</label>
                  <select className="input" value={slot.pmType} onChange={(e) => onSlotUpdate(index, { pmType: e.target.value })}>
                    {WORKOUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid-two">
              <div>
                <label className="field-label small">Workout</label>
                <input className="input" value={slot.workout} onChange={(e) => onSlotUpdate(index, { workout: e.target.value })} placeholder="Workout name" />
              </div>
              <div>
                <label className="field-label small">Type</label>
                <select className="input" value={slot.type} onChange={(e) => onSlotUpdate(index, { type: e.target.value })}>
                  {WORKOUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default function ProfileView({ profile, metrics, defaultSchedule, weekSchedules, onProfileChange, onMetricChange, onDefaultScheduleChange, onWeekScheduleChange }) {
  const [scheduleMode, setScheduleMode] = useState("default")
  const [editMonday, setEditMonday] = useState(() => toDateKey(getMondayOfDate(new Date())))

  const editMondayDate = useMemo(() => parseDateKey(editMonday), [editMonday])
  const weekLabel = useMemo(() => getWeekRangeLabel(editMondayDate), [editMondayDate])
  const isCustom = Boolean(weekSchedules[editMonday])
  const activeWeekSchedule = weekSchedules[editMonday] || defaultSchedule

  const goWeekPrev = () => {
    const d = parseDateKey(editMonday)
    d.setDate(d.getDate() - 7)
    setEditMonday(toDateKey(d))
  }
  const goWeekNext = () => {
    const d = parseDateKey(editMonday)
    d.setDate(d.getDate() + 7)
    setEditMonday(toDateKey(d))
  }

  // Shared slot update logic
  const makeSlotUpdater = (schedule, onChange) => {
    const updateSlot = (index, updates) => {
      onChange(schedule.map((s, i) => i === index ? { ...s, ...updates } : s))
    }
    const toggleSplit = (index) => {
      const slot = schedule[index]
      if (slot.split) {
        updateSlot(index, { split: false, workout: slot.amWorkout || "Workout", type: slot.amType || "gym" })
      } else {
        updateSlot(index, { split: true, amWorkout: slot.workout || "Workout", amType: slot.type || "gym", pmWorkout: slot.workout || "Workout", pmType: slot.type || "gym" })
      }
    }
    return { updateSlot, toggleSplit }
  }

  const defaultOps = makeSlotUpdater(defaultSchedule, onDefaultScheduleChange)
  const weekOps = makeSlotUpdater(activeWeekSchedule, (newSched) => onWeekScheduleChange(editMonday, newSched))

  const customizeWeek = () => {
    onWeekScheduleChange(editMonday, defaultSchedule.map((s) => ({ ...s })))
  }
  const resetWeek = () => {
    onWeekScheduleChange(editMonday, null)
  }

  return (
    <div className="stack-20">
      <div className="card pad stack-16">
        <h2>Profile</h2>
        <div>
          <label className="field-label">Name</label>
          <input className="input" value={profile.name} onChange={(e) => onProfileChange("name", e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="field-label">Goal</label>
          <select className="input" value={profile.goal} onChange={(e) => onProfileChange("goal", e.target.value)}>
            <option value="performance">Badminton performance</option>
            <option value="fat-loss">Fat loss</option>
            <option value="muscle-gain">Muscle gain</option>
            <option value="general-fitness">General fitness</option>
          </select>
        </div>
        <div className="grid-two">
          <div>
            <label className="field-label">Weight</label>
            <input className="input" value={metrics.weight} onChange={(e) => onMetricChange("weight", e.target.value)} placeholder="kg" />
          </div>
          <div>
            <label className="field-label">Resting HR</label>
            <input className="input" value={metrics.restingHeartRate} onChange={(e) => onMetricChange("restingHeartRate", e.target.value)} placeholder="bpm" />
          </div>
        </div>
        <div>
          <label className="field-label">Average sleep hours</label>
          <input className="input" value={metrics.sleepHours} onChange={(e) => onMetricChange("sleepHours", e.target.value)} placeholder="7.5" />
        </div>
      </div>

      <div className="card pad stack-16">
        <h2>Schedule</h2>
        <div className="stats-tabs">
          <button className={`stats-tab${scheduleMode === "default" ? " active" : ""}`} onClick={() => setScheduleMode("default")}>Default</button>
          <button className={`stats-tab${scheduleMode === "week" ? " active" : ""}`} onClick={() => setScheduleMode("week")}>Week</button>
        </div>

        {scheduleMode === "default" && (
          <div className="stack-16">
            <p className="muted small">Set your recurring weekly template. New weeks inherit this schedule.</p>
            <ScheduleEditor schedule={defaultSchedule} onSlotUpdate={defaultOps.updateSlot} onToggleSplit={defaultOps.toggleSplit} />
          </div>
        )}

        {scheduleMode === "week" && (
          <div className="stack-16">
            <div className="row selector-row">
              <button className="icon-btn" onClick={goWeekPrev}>←</button>
              <div className="week-selector-label">{weekLabel}</div>
              <button className="icon-btn" onClick={goWeekNext}>→</button>
            </div>

            {isCustom ? (
              <div className="stack-16">
                <div className="row between">
                  <div className="schedule-badge custom">Custom routine</div>
                  <button className="btn-link" onClick={resetWeek}>Reset to default</button>
                </div>
                <ScheduleEditor schedule={activeWeekSchedule} onSlotUpdate={weekOps.updateSlot} onToggleSplit={weekOps.toggleSplit} />
              </div>
            ) : (
              <div className="stack-12">
                <div className="schedule-badge default-badge">Using default routine</div>
                <p className="muted small">This week follows your default schedule. Customize it to create a unique routine for this week.</p>
                <button className="btn full-width" onClick={customizeWeek}>Customize this week</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
