# SheetFlow — Smoothening the flow of learning

> Most students don’t fail interviews because they didn’t solve enough problems.  
> They fail because they **can’t recall patterns when needed**.

# Learn DSA the way your brain actually learns
SheetFlow turns a static DSA sheet into an **interactive learning system** — built for retention, revision, and focused practice.
SheetFlow is a learning layer built on top of DSA sheets — turning practice into preparation.

# 🎥 **Demo Video:**  
https://www.youtube.com/watch?v=XYsWztbl9io

🌐 **Live App:**  
https://sheet-flow-blush.vercel.app/
---

## What this is

Traditional sheets:
455 problems → scroll → solve → forget
SheetFlow:

Instead of tracking *completion*, it tracks *learning*.

---

## Why this exists

Students using common sheets (Striver, Codolio, spreadsheets):

- jump randomly between topics
- forget previously solved problems
- never revise
- cannot identify weak areas
- feel progress but lack readiness

SheetFlow fixes the workflow, not the problem list.

---

## Core Features

| Feature | What it actually helps with |
|---|---|
| Topic hierarchy | prevents cognitive overload |
| Question cards | focused reading + actions |
| Mark solved | real progress tracking |
| Revision list | active recall (most important) |
| Filters & search | targeted practice |
| Random mode | interview simulation |
| Progress charts | motivation + feedback |
| Direct links (LC/YT) | no context switching |

---

## What makes it different

Static sheets are **content organizers**.  
SheetFlow is a **learning behavior tool**.

| Static Sheet | SheetFlow |
|---|---|
| You read problems | You interact with them |
| You finish topics | You master topics |
| You track count | You track retention |
| You rely on memory | You train recall |

---

## How it works (under the hood)

Topic ─> Subtopic ─> Question

- Dataset loaded from `/public/sheet.json`
- State handled via Zustand
- Progress persisted in browser storage
- SPA routing supported on Vercel CDN

---

## Tech Stack

- React + TypeScript (Vite)
- Zustand (state)
- Tailwind CSS (UI)
- Vercel (deployment)

---
## Run locally

```bash
npm install
npm run dev
```
## Production:
```bash
npm run build
npm run preview
```
## Limitations (Honest MVP Scope)
| Current Implementation | Next Step |
|---|---|
| Local storage persistence | Add user accounts & cloud sync |
| Manual revision tracking | Spaced repetition scheduler |
| Static dataset | Backend API & database |

## Vision
The goal is simple:
Not help students solve more problems.
Help them remember patterns when the interview starts.