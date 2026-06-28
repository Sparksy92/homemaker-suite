# Audit Report: Offline-First Field Reliability & Installable PWA Hardening

## Overview
This document summarizes the architectural hardening of the Homemaker Suite PWA layer to support reliable off-grid usage. We have implemented explicit service worker updates, resilient background sync retry loops, connection state monitoring, and visual confidence cues.

---

## 1. Key Accomplishments

### Explicit PWA Prompt Update Mode
- Service worker registration has been transitioned from `autoUpdate` to `'prompt'` in `vite.config.js`.
- This ensures active planners are not interrupted by unexpected page reloads when new assets are fetched in the background.

### Centralized `PwaLifecycleContext`
- Tracks browser environment conditions (`isOnline`, `isStandalone`, `isIOS`, `installPrompt`).
- Proxies Vite PWA registration states (`needRefresh`, `offlineReady`, `updateServiceWorker`).
- Registers event listeners globally and guarantees a single idempotent connection listener.

### Resilient Sync Retry Queue
- Implemented `pushQueueWithRetry()` capping background sync retries to `3` attempts spaced `15` seconds apart.
- Stores state updates (`'syncing'`, `'retrying'`, `'error'`) and maps retry counters in local sync settings.
- Low-level `pushQueue()` is reserved for explicit manual sync requests to prevent unintended background loop timers.

### Offline & Field Mode Visuals
- **Offline Indicator**: A prominent HSL-styled Amber/Sage navbar indicator signaling network status.
- **Planner Confidence Indicator**: Displays local-save timestamps and cloud-sync retry status in real-time.
- **Backup Reminder**: Monitored locally, prompting offline users to export a `.json` backup file every 14 days.

---

## 2. Technical Implementation Specifications

### Reconnect Sync Trigger Policy
1. On transitioning back to `online`:
   - If local changes are dirty (items in `homemaker_sync_queue` > 0): Run `pushQueueWithRetry()`.
   - If local queue is clean: Run `pullNow(false)` silently.
2. If conflicts are detected during silent pulls:
   - Present a non-intrusive Toast: *"Cloud changes available — review in Settings."*
   - Avoid surprise modal takeovers or page reloads during active planning.
