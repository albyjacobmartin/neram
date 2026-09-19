# Neram

Neram is a lightweight productivity app built with React + TypeScript and Vite. It combines a Pomodoro timer, ambient audio playback, and a simple focus task list to help users stay on track during deep work sessions.

## Overview

The app is designed for short, focused work cycles with intentional breaks. It helps you:

- track work, short-break, and long-break sessions
- switch between timer modes with a single click
- keep a visible task list for active priorities
- play calming ambient audio during focus sessions
- continue reliably even if the browser throttles timers in the background

## Features

### Pomodoro workflow
- Default cycle: 50 minutes of work, 10 minutes short break, 25 minutes long break
- Long break triggered after every 4 completed work sessions
- Start, pause, resume, reset, and skip controls
- Deadline-based timer logic for better accuracy during tab inactivity or background throttling
- Session selector for switching between work and break states

### Ambient soundscape
- Audio picker populated from the local public manifest
- Play/pause controls for background music or focus audio
- Current time and duration display
- Browser-safe audio handling with graceful error states

### Focus queue
- Add, complete, and remove tasks
- Remaining task count in the header
- Simple, minimal interface for managing daily work priorities

## Tech stack

- React 19
- TypeScript
- Vite
- CSS for styling

## Project structure

```text
neram/
├── public/
│   ├── audio.json
│   └── audio/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firebase.json
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+ recommended
- npm or another package manager

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

## Available scripts

```bash
npm run dev       # start the Vite development server
npm run build     # run TypeScript checks and build the production bundle
npm run preview   # preview the production build locally
npm run typecheck # run TypeScript without emitting files
```

## Notes

- Audio assets are served from the public folder and referenced through the app's asset helper utilities.
- The timer logic is implemented in the custom hook under `src/hooks/usePomodoro.ts` and is designed to keep time consistent even when the page is temporarily backgrounded.
- The UI is intentionally compact and focused on minimal distraction while working.

## Development status

This project is a personal productivity tool and is currently set up as a Vite-based React application with front-end state handling and local browser assets.