export default function DietCard({ diet, isMatchDay }) {
  return (
    <div className={`card pad stack-12${isMatchDay ? " match-day-diet" : ""}`}>
      <div>
        <h2>{diet.title}</h2>
        <p className="muted" style={{ marginTop: 4 }}>{diet.intro}</p>
      </div>
      <ul className="diet-list">
        {diet.items.map((item, index) => (
          <li key={index}><span>•</span><span>{item}</span></li>
        ))}
      </ul>
    </div>
  )
}
