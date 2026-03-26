export default function NotesView({ value, onChange }) {
  return (
    <div className="stack-16">
      <div className="card pad stack-12">
        <h2>Badminton Notes</h2>
        <textarea className="input textarea tall" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Track match sharpness, movement, timing, stamina, weak points." />
      </div>
    </div>
  )
}
