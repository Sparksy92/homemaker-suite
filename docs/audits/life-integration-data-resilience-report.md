# Audit Report: Life Integration & Data Resilience

This report details the design and implementation of the data resilience mechanisms added to Homemaker Suite.

## Overview
As an offline-first PWA intended for off-grid and resilient living, user data durability is paramount. Users must be able to export, verify, import, and clear their local-first state without relying on server-side databases or risking cross-origin data loss.

---

## 1. Local Data Architecture

### Allowlisted localStorage Keys
To avoid polluting or clearing other keys on the same origin (such as other web applications hosted on the same local server or testing environment), the app restricts all data exports and clear operations to the following explicit allowlist:
* `homemaker_user`: User profile information.
* `homemaker_favorites`: Favorited guides and articles.
* `homemaker_read_guides`: Reading history and progression tracking.
* `homemaker_last_accessed`: Quick resume guide state.
* `homemaker_settings`: Notification and preference toggles.
* `homemaker_home_widgets`: Dashboard customization widgets configuration.
* `homemaker_sustainability`: Water/Food reserves and headcount parameters.
* `homemaker_water_inventory`: Container details for the Water Tracker.
* `weather_enabled`: Weather widget opt-in preference.
* `homemaker_beta_notice_dismissed`: Beta introduction banner dismissal state.

### IndexedDB Observations
* **Database Name**: `homemaker_observations_db`
* **Store Name**: `observations`
* **Content**: Contains captured species sightings, field notes, images, timestamp, coordinates, and coordinate accuracy.

---

## 2. Export & Import Flow

### Data Schema Versioning
* **Current Schema Version**: `1`
* The exported JSON payload is structured as follows:
```json
{
  "appName": "Homemaker Suite",
  "schemaVersion": 1,
  "exportedAt": "2026-06-27T03:57:35.000Z",
  "localStorage": {
    "homemaker_user": { ... },
    "homemaker_favorites": [ ... ],
    ...
  },
  "indexedDB": {
    "observations": [ ... ]
  }
}
```

### Verification & Validation Rules
* **Format Checks**: Reject malformed, corrupted, or non-JSON files.
* **App Identification**: Verify `appName === 'Homemaker Suite'`. Reject foreign files.
* **Version Control**: Verify `schemaVersion === 1`. Restrict import of future incompatible schema formats until migrations are implemented.
* **IndexedDB overwrite protocol**: Overwriting active observations clears the database store (`store.clear()`) first before calling `.put()` on the backup data. This ensures no stale or deleted records remain.

---

## 3. Scoped Clearing
Replacing `localStorage.clear()` with a scoped loop ensures that only allowlisted keys are removed. The IndexedDB observations database is deleted cleanly via `indexedDB.deleteDatabase()`, forcing a fresh state reload on the next user initialization.

---

## 4. Privacy & Security Clarifications
1. **Observation Coordinates**: All coordinates captured during flora/fauna sightings are stored strictly in IndexedDB locally. **Zero tracking, zero cloud storage, zero network transmission.**
2. **Weather Widget Approximate Location**: When opt-in is enabled, the approximate location coordinates (latitude and longitude) are sent directly to the public Open-Meteo API to fetch local forecasts. No personal details are associated with this request.

---

## 5. Manual Verification Checklist

### Tools Hash/Query Deep Linking
1. Navigate to `#/tools?tab=water`. Verify that the Water tab loads active immediately.
2. Click other tabs (Chef, Plans, Subs). Verify that the URL updates to `#/tools?tab=X` without adding a new page to the browser history (using `replace: true`).

### GPS Consent Flow
1. Open the Camera Sighting modal. Verify that **no** Geolocation prompt displays on mount.
2. Verify the visible card notice: *"Observation coordinates are stored locally on this device only."*
3. Click "Add GPS Location". Allow the browser Geolocation prompt. Verify coordinates and accuracy display cleanly.
4. Click "Clear" to reset to idle state.
5. Click "Add GPS Location", deny permission, and verify the card displays "GPS permission denied" with a "Retry" button.

### Export, Import, and Reset
1. Go to Settings. Click **Export Data**. Verify that a `.json` backup file with filename format `homemaker-suite-backup-YYYY-MM-DD.json` downloads successfully.
2. Modify user name, add a favorite guide, or add a mock observation.
3. Import the backup file. Confirm the overwrite prompt. Verify the page reloads and restores settings and observations to the backup state.
4. Click **Clear App Data**. Confirm. Verify all local configurations and IndexedDB databases are deleted, and guest settings initialize fresh.
