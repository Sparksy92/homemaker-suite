# Audit Report: Sync Trust, Testing & Conflict UX

This report documents the validation checks, test coverages, and conflict preview overlays integrated during Phase 2 cloud sync hardening.

---

## 1. Test Coverage Overview

We installed Vitest and React Testing Library in `app/devDependencies` and configured them natively in Vite.

### 1.1 Service Tests (`src/services/__tests__`)
*   **`homesteadPlanningService.test.js`**:
    *   Verifies standard planner loading when LocalStorage keys are clean or absent.
    *   Asserts `savePlan()` stamps `updatedAt` and correctly triggers push sync.
    *   Verifies `resetPlan()` saves a correct deleted tombstone `{ deletedAt, updatedAt, schemaVersion }`.
    *   Verifies loading a tombstoned plan restores empty default schemas to the UI.
*   **`homesteadSyncService.test.js`**:
    *   Verifies cloud sync is fully disabled by default.
    *   Confirms background sync queues do not initiate calls before user opt-in.
    *   Tests sync state transitions (`idle`, `syncing`, `conflict`, `error`).
    *   Asserts pull merges and remote tombstone propagation.
    *   Asserts module conflict resolution options ("Keep Local", "Use Remote", "Latest Timestamp").
*   **`appDataService.test.js`**:
    *   Asserts LocalStorage allowlist keys (`homemaker_sync_config`, `homemaker_sync_queue`).
    *   Verifies the app-reset sign-out regression test: calling `clearAppData()` executes `disableCloudBackup()` (which signs out of Supabase via SDK) before resetting LocalStorage keys.

### 1.2 Component Tests (`src/components/__tests__`)
*   **`ImageCarousel.test.jsx`**:
    *   Asserts that empty or invalid image lists fall back to the camera icon layout.
    *   Asserts that inputs containing `placeholder`, `no-image`, `missing`, `null`, or `undefined` are filtered out.
    *   Asserts that duplicate image strings are removed.
    *   Asserts that firing `onError` events on `<motion.img>` dynamically removes broken files from the active carousel index.

---

## 2. Sync Conflict Detection Policy

Conflicts are tracked at the module level. A conflict is triggered if:
1.  The key exists both in LocalStorage and on the remote database.
2.  The local plan key is present in the sync queue (unpushed changes).
3.  The remote row's `updated_at` differs from the local copy's `updatedAt`.
4.  One side has a deletion tombstone and the other side contains active tracking data.

Silent overwrites are fully blocked. Conflicts are presented in a glassmorphic comparison modal showing side-by-side timestamps, offering:
*   **Keep Local**: Overwrite remote row with local state.
*   **Use Remote**: Overwrite local device with remote row.
*   **Use Latest Timestamp**: Chronologically compare timestamps, applying the newer copy.

---

## 3. Database Row-Level Security (RLS)
*   Transactional verification script added under `supabase/tests/rls_validation_test.sql`.
*   Asserts that authenticated and anonymous users can only insert, select, update, or delete rows where `auth.uid() = user_id`.
*   Verifies the `profiles` table contains no credentials or password fields.

---

## 4. Deployment Verification
*   **Vercel Routing**: Configured rewrite rules in `vercel.json` routing all routes to `index.html` to allow clean react-router SPA deep-linking and browser refreshes.
*   **PWA precaching**: Confirmed `vite-plugin-pwa` precaches 58 assets.
*   **Rollback Procedures**: Redeplying dist output via Cloudflare wrangler remains fully supported and documented in `DEPLOYMENT.md` if Vercel paths encounter production issues.
