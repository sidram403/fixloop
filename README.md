# FixLoop ⚡

**FixLoop** is a personal error–fix log for developers. You record the exact error you hit and what fixed it. Next time the same (or a similar) error appears, you search your logs and get your own solution in seconds—no Google, no Stack Overflow, no context switching.

---

## The idea

Developers waste time on errors they’ve already solved: same stack trace, different project or machine, and the fix is forgotten. FixLoop turns your past fixes into a searchable, local knowledge base. Paste an error, get your previous solution. Everything stays in your browser; there is no backend, no AI, and no account.

---

## How it works

1. **Log a fix** — When you fix something, paste the error message and the solution (and optional tags, e.g. `react`, `cors`). Data is stored in your browser (IndexedDB) and can auto-save as a draft.
2. **Search** — When you hit an error again, paste it into Search. The app normalizes the text (strips paths, line numbers, etc.) and uses fuzzy search over your logs so similar errors match.
3. **Reuse** — You see your past fixes with match quality (strong / possible / weak). Expand a result to see the full fix, or jump to “Log this fix” to record a new one with the error pre-filled.

No data is sent to any server. The app works fully offline after the first load.

---

## How it helps

- **Stop re-solving the same errors** — Your fixes are searchable by error text and tags.
- **Faster than searching the web** — Your own notes are tailored to your stack and environment.
- **No lock-in** — Export all logs as JSON anytime; import them on another device or backup.
- **Light/dark theme** — Preference saved in the browser.
- **Keyboard-friendly** — ⌘K → Search, ⌘N → Log fix, ? → Shortcuts.

---

## Features

| Area | Features |
|------|----------|
| **Log a fix** | Error + fix (required), tags (with suggestions), time lost; draft auto-save; ⌘+Enter submit; edit existing fixes |
| **Search** | Paste error → normalized + fuzzy search; top 5 results with match %; strong/possible/weak badges; “View full fix” inline; “Log this fix” when no match |
| **My logs** | List (newest first), live search/filter, filter by tag, expand row for full details, edit, delete, export JSON, import JSON |
| **Dashboard** | Total fixes, total time saved, most used tag; last 5 entries; big search bar (pre-fills Search); empty-state “Get started” |
| **App** | Light/dark theme (persisted), toast notifications, loading skeletons, responsive layout, page titles, works offline |

---

## Tech stack

- **React 18** + **Vite**
- **Dexie.js** (IndexedDB)
- **Tailwind CSS** (with CSS variables for theming)
- **Fuse.js** (fuzzy search)
- **lucide-react** (icons)

Fonts: Geist (UI), IBM Plex Mono (code/errors).

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

First load seeds sample logs so you can try Search and My Logs immediately. Replace or delete them as you add your own.

---

## Build

```bash
npm run build
npm run preview
```

---

## Contributing

FixLoop is open for contributions. Ideas for improvement:

- Better fingerprinting or search (e.g. by error type, language)
- More export/import formats
- Optional sync (e.g. file-based or your own backend)
- Browser extension or CLI to log from the terminal
- UI/UX and accessibility improvements
- Bug fixes and performance tweaks

Open an issue or a pull request; any thoughtful improvement is welcome.
