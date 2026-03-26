export default function WorkoutModal({ open, workout, onClose }) {
  if (!open || !workout) return null
  return (
    <div className="modal-backdrop">
      <div className="modal-panel stack-14">
        <div className="row between">
          <h2>{workout.title}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <p className="muted">{workout.goal}</p>
        <div className="stack-14">
          {workout.sections.map((section) => (
            <div key={section.name}>
              <h3>{section.name}</h3>
              <ul className="diet-list">
                {section.items.map((item, index) => (
                  <li key={index}><span>•</span><span>{item}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
