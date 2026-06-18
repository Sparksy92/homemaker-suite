# Homemaker Suite - Developer Readme

This repository contains the source code for the Homemaker Suite, a React-based Progressive Web App (PWA) designed for homesteading and survival management.

## Tech Stack
-   **Frontend**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Storage**: IndexedDB (Local Observations), LocalStorage (Settings/Progress/Water Tracker)
-   **Deployment**: Cloudflare Pages
-   **Mobile**: Capable of being wrapped via Capacitor (Android/iOS)

## Directory Structure
-   `/app`: The React application source.
    -   `/app/src/data`: JSON databases (Recipes, Wildlife).
    -   `/app/public/content`: The library of Markdown guides.
    -   `/app/public/images`: Asset directories (wildlife, botany, patterns).
    -   `/app/scripts`: Automation scripts (generating indexes, downloading assets).
-   `/app/src/modules`: Feature-specific logic (Food, Wilderness).
-   `/app/src/components`: Shared UI components (including `WaterTracker`).
-   `/app/src/pages`: Main application page views (including `Library`, `Tools`, `Wildlife`).

## Local Development

From the root directory:
1. Navigate to the app directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   This will automatically trigger pre-development index and metadata generation in the background.

## Linting and Testing

To verify code quality and build safety before committing:
- **Lint Codebase**:
  ```bash
  npm run lint
  ```
- **Test Build Compilation**:
  ```bash
  npm run build
  ```

## Deployment

The app is built and deployed to Cloudflare Pages via:
```bash
npm run deploy
```
This triggers `npm run build` (which regenerates indices and compiles static assets) and uses Wrangler to deploy the output `dist` folder to Cloudflare Pages.

## Content Management

### Adding a New Guide
1. Create a new `.md` file under the appropriate subdirectory in `app/public/content/`.
2. Format the file with YAML frontmatter at the very top:
   ```markdown
   ---
   id: category-XX.X
   tags: [tag1, tag2, tag3]
   timeframe: immediate
   difficulty: beginner
   module: XX Category Name
   section: XX.X
   ---
   # XX.X Guide Title
   
   Guide content...
   ```
3. Run `npm run dev` or `npm run build`. The pre-build automation hooks will automatically detect the new file, sort it, recalculate word counts, extract tags, and regenerate `/app/public/library_index.json` and `/app/public/guides_metadata.json`.

### Index and Metadata Generation
- **`build-index.js`**: Scans the `app/public/content` directory and produces `library_index.json` using a natural sort algorithm.
- **`build-metadata.js`**: Parses the YAML frontmatter in each guide, calculates word counts, and generates `guides_metadata.json` to support category matching, estimated-read-times, tags, and multi-field search in the Library UI.

### Safety-Gated Guides
- Guides with high risks of food safety or lethal poisoning (e.g., Mushroom Safety, Bio-Sand Filtration, Salting and Smoking) are listed under `LETHAL_RISK_FILES` in `Library.jsx`.
- When clicked, these guides display a Shield-Alert-backed Safety Acknowledgment Modal.
- The acknowledgment is stored in the browser's `sessionStorage` under `safety_ack_[GuideFilename.md]` to avoid nagging the user repeatedly in the same session.

## Feature Spotlight: Water Inventory Tracker
The Water Inventory Tracker is an offline-first MVP dashboard built under the **Tools** tab (`/tools#water`).
- **Offline Readiness**: All container configurations, levels, dates, and notes are persisted locally on-device under `localStorage` with the key `homemaker_water_inventory`.
- **IndexedDB TODO**: There is a clear architecture plan to migrate this tool to IndexedDB in future iterations to allow P2P syncing (via WebRTC) across devices on a homestead without internet connectivity.
- **Warnings & Actions**:
  - *Low Water Level*: Warns if current level is $\le 25\%$ of capacity. Integrates direct library deep-links to `15.1 Water Procurement` and `15.7 Bio-Sand Filtration` for immediate mitigation.
  - *Filter Overdue*: Warns if the next filter change date is in the past.
  - *Stale/Old Water Test*: Warns if the last water test date is older than 90 days or if the status is marked as 'Unsafe'.
