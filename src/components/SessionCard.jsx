import { useState } from "react"

export default function SessionCard({ day, onUpdate, onOpenWorkout, hasWorkoutModal }) {
  const [showRpeInfo, setShowRpeInfo] = useState(false)

  return (
    <div className={`card pad stack-16${day.matchDay ? " match-day" : ""}`}>
      {day.matchDay ? (
        <>
          <div className="row between start">
            <div>
              <h2>⚔️ Match Day</h2>
              <p className="muted">Time to compete — give it everything.</p>
            </div>
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <button type="button" className="match-day-btn active" onClick={() => onUpdate("matchDay", false)}>🏸</button>
              <div className="badge badge-match">match</div>
            </div>
          </div>

          <label className="check-panel">
            <div>
              <div className="label-title">Match Completed</div>
              <div className="muted small">Mark when done</div>
            </div>
            <input type="checkbox" checked={day.split ? (day.amCompleted && day.pmCompleted) : day.completed} onChange={(e) => {
              if (day.split) { onUpdate("amCompleted", e.target.checked); onUpdate("pmCompleted", e.target.checked) }
              else onUpdate("completed", e.target.checked)
            }} />
          </label>
        </>
      ) : day.split ? (
        <>
          <div className="split-session">
            <div className="row between">
              <h3>AM · {day.amWorkout}</h3>
              <div className="row gap-8" style={{ alignItems: "center" }}>
                <button type="button" className="match-day-btn" onClick={() => onUpdate("matchDay", true)}>🏸</button>
                <div className={`badge badge-${day.amType}`}>{day.amType}</div>
              </div>
            </div>
            <label className="check-panel">
              <div><div className="label-title">AM Completed</div></div>
              <input type="checkbox" checked={day.amCompleted} onChange={(e) => onUpdate("amCompleted", e.target.checked)} />
            </label>
          </div>
          <div className="split-session">
            <div className="row between">
              <h3>PM · {day.pmWorkout}</h3>
              <div className={`badge badge-${day.pmType}`}>{day.pmType}</div>
            </div>
            <label className="check-panel">
              <div><div className="label-title">PM Completed</div></div>
              <input type="checkbox" checked={day.pmCompleted} onChange={(e) => onUpdate("pmCompleted", e.target.checked)} />
            </label>
          </div>
        </>
      ) : (
        <>
          <div className="row between start">
            <div>
              <h2>{day.workout}</h2>
              <p className="muted">Track this session one day at a time.</p>
            </div>
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <button type="button" className="match-day-btn" onClick={() => onUpdate("matchDay", true)}>🏸</button>
              <div className={`badge badge-${day.type}`}>{day.type}</div>
            </div>
          </div>

          <label className="check-panel">
            <div>
              <div className="label-title">Completed</div>
              <div className="muted small">Mark when done</div>
            </div>
            <input type="checkbox" checked={day.completed} onChange={(e) => onUpdate("completed", e.target.checked)} />
          </label>
        </>
      )}

      <div className="grid-two">
        <div>
          <label className="field-label">Energy</label>
          <select value={day.energy} onChange={(e) => onUpdate("energy", e.target.value)} className={`input${day.energy === "" ? " input-placeholder" : ""}`}>
            <option value="" disabled>Select…</option>
            <option value="1">1 - Very low</option>
            <option value="2">2 - Low</option>
            <option value="3">3 - Okay</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        <div>
          <label className="field-label">Duration</label>
          <input value={day.duration} onChange={(e) => onUpdate("duration", e.target.value)} placeholder="mins" className="input" />
        </div>
      </div>

      <div className="grid-two">
        <div>
          <label className="field-label row gap-8">RPE <button type="button" className="info-btn" onClick={() => setShowRpeInfo(true)}>i</button></label>
          <select value={day.rpe} onChange={(e) => onUpdate("rpe", e.target.value)} className={`input${day.rpe === "" ? " input-placeholder" : ""}`}>
            <option value="" disabled>Select…</option>
            <option value="1">1 - Very easy</option>
            <option value="2">2 - Easy</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - Hard</option>
            <option value="5">5 - Very hard</option>
          </select>
        </div>
        <div>
          <label className="field-label">Soreness</label>
          <select value={day.soreness} onChange={(e) => onUpdate("soreness", e.target.value)} className={`input${day.soreness === "" ? " input-placeholder" : ""}`}>
            <option value="" disabled>Select…</option>
            <option value="1">1 - None</option>
            <option value="2">2 - Mild</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - High</option>
            <option value="5">5 - Severe</option>
          </select>
        </div>
      </div>

      <div className="stack-8">
        <label className="check-row"><input type="checkbox" checked={day.mealsOnTrack} onChange={(e) => onUpdate("mealsOnTrack", e.target.checked)} /> Diet on track</label>
        <label className="check-row"><input type="checkbox" checked={day.hydration} onChange={(e) => onUpdate("hydration", e.target.checked)} /> Hydrated</label>
        <label className="check-row"><input type="checkbox" checked={day.sleep} onChange={(e) => onUpdate("sleep", e.target.checked)} /> Slept well</label>
      </div>

      <div>
        <label className="field-label">Notes</label>
        <textarea className="input textarea" value={day.notes} onChange={(e) => onUpdate("notes", e.target.value)} placeholder="Footwork, stamina, sharpness, soreness, anything useful." />
      </div>

      {showRpeInfo && (
        <div className="modal-backdrop" onClick={() => setShowRpeInfo(false)}>
          <div className="modal-panel stack-12" onClick={(e) => e.stopPropagation()}>
            <h2>RPE — Rate of Perceived Exertion</h2>
            <p className="muted">A subjective measure of how hard a workout feels, rather than something measured like heart rate or weight.</p>
            <button className="btn full-width" onClick={() => setShowRpeInfo(false)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
