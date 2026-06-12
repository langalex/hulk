# Hulk

A mobile-friendly progressive web app for tracking daily protein intake.

## What it does

Hulk helps you log how much protein you eat throughout the day and see your running total in grams.

- **Daily log** — Add intakes with a description, time, and gram amount. Browse previous days or jump back to today.
- **Running total** — See the sum of all protein logged for the selected day at a glance.
- **Presets** — Save common foods (e.g. a protein shake) in Settings and tap them when logging to fill in the details quickly. A multiplier lets you scale a preset (e.g. 2× a serving).
- **Local-first** — Data is stored in the browser with PouchDB, so it works offline and stays on your device.
- **Installable PWA** — Add Hulk to your home screen for quick access like a native app.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
