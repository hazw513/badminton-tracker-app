export default function ThemeToggle({ themeName, onToggle }) {
  const isDark = themeName === "dark"
  return (
    <button type="button" onClick={onToggle} className={isDark ? "theme-toggle theme-toggle-dark" : "theme-toggle"}>
      <span aria-hidden="true">{isDark ? "🌙" : "☀️"}</span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  )
}
