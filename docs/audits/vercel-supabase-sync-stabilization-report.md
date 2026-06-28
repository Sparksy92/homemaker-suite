# Audit Report: Vercel & Supabase Cloud Sync Stabilization

This report documents the security, performance, and functionality fixes applied during the stabilization phase of the Vercel hosting migration and Supabase database sync integration.

---

## 1. Resolved Issues

### 1.1 Image Carousel Bug
*   **Root Cause**: The shared `ImageCarousel.jsx` component was running "Lazy Magic Discovery" by default, checking `/images/wildlife/speciesId_X.jpg` files. When PWA caching or rewrite rules returned success codes for non-existent image paths, the carousel created empty slides containing missing images.
*   **Resolution**: 
    - Auto-discovery is now disabled by default (`enableDiscovery = false`).
    - Input images are strictly sanitized to filter out empty strings, null values, or paths containing `"placeholder"`.
    - Added an `onError` handler to `<motion.img>` that automatically removes failing image paths from the carousel list in real time.
    - If all images fail or none are supplied, a clean single fallback container ("No Image Available") is shown.

### 1.2 package.json Deploy Scripts Stale
*   **Root Cause**: The global `"deploy"` script in `app/package.json` still targeted Wrangler (Cloudflare Pages), contradicting the Vercel migration plan.
*   **Resolution**:
    - Renamed the Cloudflare deploy script to `"deploy:cloudflare"`.
    - Created a new `"deploy:vercel"` script calling `vercel --prod` to deploy directly to Vercel.

### 1.3 Sync Config Surviving App Data Clears
*   **Root Cause**: `homemaker_sync_config` and `homemaker_sync_queue` keys in LocalStorage were not cleaned up during app resets because they were omitted from the data service allowlist.
*   **Resolution**:
    - Added both keys to the `LOCAL_STORAGE_ALLOWLIST` in `appDataService.js`.
    - Resets, manual data exports, and clear data wipes now clean up the local cloud synchronization state, returning the app to local-only mode.

### 1.4 Background Sync running before Authentication
*   **Root Cause**: Toggling the sync switch in the Settings UI immediately set `enabled: true` in localStorage. If the user wasn't signed in, background sync runs (`pushQueue`) threw "Not authenticated" errors.
*   **Resolution**:
    - Refactored `Settings.jsx` to use a local `showSyncSetup` state.
    - Swapping the toggle on only opens the auth setup forms. Sync is not enabled (`enabled: true`) in LocalStorage until a Supabase sign-in (anonymous or email) succeeds.

### 1.5 Incomplete Deletion Tombstone Syncing
*   **Root Cause**: Local deletions or resets did not write a tombstone marker, causing remote plans to persist indefinitely in the database.
*   **Resolution**:
    - Refactored `resetPlan(key)` in `homesteadPlanningService.js` to save a tombstone record `{ deletedAt: "...", updatedAt: "...", schemaVersion: 1 }` inside LocalStorage.
    - Refactored `loadPlan(key)` to treat tombstoned plans as new/empty default states for the UI.
    - Configured `pushQueue()` to pass `deleted_at: parsed.deletedAt || null` on upserts.
    - Configured `pullNow()` to read `deleted_at` fields and overwrite local storage keys with tombstone structures if remote deletion timestamps are newer.

### 1.6 Verification of Planner Writes
*   Verified that all 8 sub-planners write local states through `savePlan` or `updatePlan` in `homesteadPlanningService.js`, which automatically triggers the debounced sync push hook `triggerSyncPush(key)`.

---

## 2. Manual Verification Walkthrough

1.  **Local-Only Mode**: Default settings leave Cloud Backup toggled off. All sub-planners and profile changes function entirely in the browser (LocalStorage).
2.  **Enable Cloud Backup**: Swapping the switch displays the Auth panel. Checking "Anonymous" signs the user in via Supabase anonymous credentials, changes the toggle to active, and performs an initial push.
3.  **Conflict & Tombstones**: Resetting a planner writes a tombstone, which syncs to the DB. Pulling on a clean client restores the tombstone structure, resetting the local planner view.
4.  **Clear App Data**: Clicking "Clear App Data" clears all profile and sync credentials, reverting the app to local-only mode.
