# PWA Mobile Testing Checklist

This checklist provides a set of manual QA steps to verify that Homemaker Suite runs correctly as an offline-first mobile application.

---

## 1. Installation Flow Validation

### Android (Chrome / Firefox)
- [ ] Open the app on mobile Chrome.
- [ ] Observe if the **Install Homemaker Suite** banner appears inline on the home dashboard.
- [ ] Click **Install**. Verify the native browser installation popup is triggered.
- [ ] Confirm the app is added to the home screen and opens without standard browser header bars (Standalone Mode).

### Apple iOS (Safari)
- [ ] Open the app on iOS Safari.
- [ ] Confirm that the **Install Homemaker Suite** card offers an **Instructions** button.
- [ ] Click **Instructions**. Verify the share sheet instructions overlay appears.
- [ ] Verify that tapping Share -> **Add to Home Screen** adds the icon and loads Standalone Mode.

---

## 2. Offline Resilience & Sync Retries

### Simulating Offline States
- [ ] Turn on **Airplane Mode** or disable Wi-Fi/Cellular data.
- [ ] Verify the top navbar changes to **Field Mode (Offline)**.
- [ ] Edit a plan (e.g. add a crop to the Garden Planner). Verify it saves locally and states **Offline — Pending queue sync**.

### Reconnection Syncing
- [ ] Re-enable network connections.
- [ ] Verify the navbar shifts back to **Online & Synced**.
- [ ] Check that pending local changes are pushed to Supabase automatically.
- [ ] Verify that a silent pull does not trigger unexpected page reloads.

---

## 3. Service Worker Updates
- [ ] Trigger an update to the service worker code.
- [ ] Verify the **New Update Available** card appears at the bottom left.
- [ ] Click **Later**. Ensure the prompt closes and the page does not reload.
- [ ] Click **Update Now**. Verify the page reloads and applies updates.
