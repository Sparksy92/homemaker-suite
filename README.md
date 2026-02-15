# Homemaker Suite - Developer Readme

This repository contains the source code for the Homemaker Suite, a React-based Progressive Web App (PWA) designed for homesteading and survival management.

## Tech Stack
-   **Frontend**: React (Vite)
-   **Styling**: Vanilla CSS / Tailwind (where requested)
-   **Storage**: IndexedDB (Local Observations), LocalStorage (Settings/Progress)
-   **Deployment**: Cloudflare Pages
-   **Mobile**: Capable of being wrapped via Capacitor (Android/iOS)

## Directory Structure
-   `/app`: The React application source.
    -   `/app/src/data`: JSON databases (Recipes, Wildlife).
    -   `/app/public/content`: The library of Markdown guides.
    -   `/app/public/images`: Asset directories (wildlife, botany, patterns).
-   `/app/src/modules`: Feature-specific logic (Food, Wilderness).
-   `/app/src/components`: Shared UI components.

## Local Development
1. `cd app`
2. `npm install`
3. `npm run dev`

## Deployment
The app is deployed to Cloudflare Pages via:
`npm run deploy` (requires Wrangler)

## Content Management
New guides should be added as `.md` files in the appropriate folder under `app/public/content`. The index is automatically updated via `generate_index.js` (if implemented) or manually registered in component logic.
