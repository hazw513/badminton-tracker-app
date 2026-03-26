export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export const WORKOUT_TYPES = [
  { value: "gym", label: "Gym" },
  { value: "badminton", label: "Badminton" },
  { value: "conditioning", label: "Conditioning" },
  { value: "recovery", label: "Recovery" },
  { value: "rest", label: "Rest" },
]

export const DEFAULT_SCHEDULE = [
  { label: "Monday", split: false, workout: "Lower Body + Core", type: "gym" },
  { label: "Tuesday", split: true, amWorkout: "Badminton", amType: "badminton", pmWorkout: "Badminton", pmType: "badminton" },
  { label: "Wednesday", split: false, workout: "Active Recovery", type: "recovery" },
  { label: "Thursday", split: false, workout: "Upper Body + Power", type: "gym" },
  { label: "Friday", split: false, workout: "Speed + Agility", type: "conditioning" },
  { label: "Saturday", split: false, workout: "Rest / Light Movement", type: "rest" },
  { label: "Sunday", split: false, workout: "Badminton", type: "badminton" },
]
