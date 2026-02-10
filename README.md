# Sheet Flow: Smoothens your flow of learning DSA!

A modern, mobile-first DSA practice interface inspired by Codolio and Striver’s sheets, with streamlined navigation, powerful filtering, and clear progress tracking. Built with React + Vite + TypeScript and Tailwind CSS.

## Executive Summary
- Builds on Striver/Codolio strengths and adds a premium, study-focused visual language.
- Fixes contrast/readability issues; introduces clear hierarchy and spacing.
- Adds micro-interactions: hover, active, transitions, and animated progress.
- Clarifies layout: sidebar topics, filter bar, sub-topics, and focused question cards.
- Visual indicators everywhere: difficulty badges, accent bars, status tags.
- Rich progress visualization: donut, bars, and topic heatmap.

## Better Than Existing UIs
- Visual hierarchy
  - Strong section separation; clean spacing; card-focused reading experience.
- Contrast and readability
  - Dark navy backgrounds with subtle borders; white/gray text tuned for legibility.
- Micro-interactions
  - Hover states, smooth transitions, subtle elevation on card hover.
- Difficulty/status indicators
  - Colored difficulty badges (Easy=green, Medium=amber, Hard=red), accent bar on cards.
- Progress visualization
  - Topic heatmap grid, donut percent, horizontal difficulty bars.
- Action clarity
  - Primary/secondary button weights; always-visible sidebar toggle icon.
- Mobile-first flow
  - Topic → question list → inline question card (no long scroll).

## Navigation
- Header
  - Title, theme toggle, and Reload to sync with the API.
- Sidebar (Topics)
  - Topic rows with solved/total counts and animated gradient progress bars.
  - Click to focus; toggle visibility via the window icon.
  - Edit Topics: rename topic names directly from the sidebar.
- Filter Bar
  - Search field, Solved/Difficulty/Order dropdowns, Random picker.
  - Tabs: Overview (heatmap), Revision (list management).
- Sub-topics
  - Add new sub-topics; switch to scope questions.
- Add Question
  - Users can create/edit/delete questions under specific topics and sub-topics.
- Questions
  - Mobile list-first; tap to open the inline card. Desktop shows stacked cards.
- Question Card
  - Title, metadata, difficulty badge, tags.
  - Actions: Solved/Unsolved, Revision add/remove, Notes, Open link.
  - Themed LeetCode and YouTube icons (dark/light compatible).
- Right Panel (Desktop)
  - Revision list, progress donut, difficulty bars, and streak details.

## Development
- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`

## Notes
- Local files excluded from git: Prompt.txt, UI/, sheet.json (see .gitignore).
- Data loads from Codolio’s Striver SDE API; state persists to localStorage.
