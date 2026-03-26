# Badminton Tracker App

## Setup in Visual Studio Code

1. Install Node.js 18 or newer.
2. Download and unzip this project.
3. Open the folder in VS Code.
4. Open the terminal in VS Code.
5. Run:

```bash
npm install
npm run dev
```

6. Open the local URL shown in the terminal.

## File structure

- `src/App.jsx` — main state and page wiring
- `src/components/` — UI pieces
- `src/data/` — workouts and diet content
- `src/utils/` — helpers for storage, dates, and tests
- `src/styles.css` — styling

## Why this avoids canvas limits

Because content is split into small files, you can edit just one area at a time instead of replacing a giant single file.
