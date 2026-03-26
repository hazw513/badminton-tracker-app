export default function DaySelector({ dayLabel, dateLabel, isToday, day, onGoToday, onPrev, onNext }) {
  return (
    <div className="card pad stack-12">
      <div className="row between">
        <div className="small muted">Schedule</div>
        <button type="button" className="today-btn" onClick={onGoToday}>📍 Today</button>
      </div>
      <div className="row selector-row">
        <button className="icon-btn" onClick={onPrev}>←</button>
        <div className={`day-tile-single${isToday ? " today" : ""}`}>
          <div className="row between">
            <div>
              <div className="day-name">{dayLabel}</div>
              <div className="day-date">{dateLabel}</div>
            </div>
            <div className="row gap-8">
              {isToday && <div className="today-badge">TODAY</div>}
              {day.split ? (
                <div className="day-meta">
                  <span className={day.amCompleted ? "dot done" : "dot"} title="AM" />
                  <span className={day.pmCompleted ? "dot done" : "dot"} title="PM" />
                </div>
              ) : (
                <div className="day-meta">
                  <span className={day.completed ? "dot done" : "dot"} />
                </div>
              )}
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={onNext}>→</button>
      </div>
    </div>
  )
}
