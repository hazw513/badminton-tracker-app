export function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function loadFromStorage(key, fallback) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return safeParse(raw) ?? fallback
  } catch {
    return fallback
  }
}

export function saveToStorage(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {}
}
