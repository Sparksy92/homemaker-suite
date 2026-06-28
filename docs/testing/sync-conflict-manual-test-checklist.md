# Manual Verification Test Checklist: Sync & Conflicts

Follow these instructions to verify sync integration, toast feedback, tombstones, and conflict resolution behaviors.

---

## 1. Setup Validation

- [ ] Open the app locally (`npm run dev`).
- [ ] Open a second browser session (Incognito or separate browser) to act as a secondary device.

---

## 2. Cloud Sync Activation & States

- [ ] **Opt-In Check**: Go to Settings. Cloud Backup switch should be off. All planners (e.g. Garden Planner) should load and save locally without error.
- [ ] **Auth Gate**: Turn the switch on. Verify the Sign In / Anonymous setup panel opens, but the sync config remains disabled in LocalStorage until a button is clicked.
- [ ] **Anonymous Setup**: Click **Anonymous**. Verify a toast appears: *"Anonymous backup activated!"*, the switch changes to active, and the dashboard stats appear.

---

## 3. Standard Push & Pull (No Conflicts)

- [ ] On Device 1, add a bed in the **Garden Planner**.
- [ ] Go to Settings and click **Push Now**. Verify toast *"Data pushed to cloud database successfully!"* appears.
- [ ] On Device 2, log in with the same credentials (or run Pull on same session). Click **Pull Latest**.
- [ ] Verify toast *"Data pulled successfully!"* appears, the app reloads, and the bed appears in the Garden Planner.

---

## 4. Conflict Resolution Flows

- [ ] On Device 1, modify the **Garden Planner** (e.g. rename a bed to "Device 1 Bed") but do NOT push.
- [ ] On Device 2, modify the **Garden Planner** (e.g. rename the bed to "Device 2 Bed") and click **Push Now** in Settings.
- [ ] Go back to Device 1. Click **Pull Latest**.
- [ ] Verify the **Sync Conflict Detected** modal opens.
- [ ] **Test Option - Keep Local**:
    - Click **Keep Local Version**.
    - Verify conflict modal closes and toast *"Conflicts resolved successfully!"* appears.
    - Confirm local changes override the cloud backup.
- [ ] **Test Option - Use Remote**:
    - Repeat conflict setup. Click **Use Cloud Backup Version**.
    - Confirm the local device is overwritten with the cloud backup.
- [ ] **Test Option - Latest Timestamp**:
    - Repeat conflict setup. Click **Resolve by Latest Timestamp**.
    - Confirm the newer timestamp version is selected.

---

## 5. Deletion & Tombstones

- [ ] On Device 1, clear the **Pantry Planner** (click Reset / Clear).
- [ ] Verify a tombstone `{ deletedAt: "...", updatedAt: "..." }` is saved under `homemaker_pantry_plan` in LocalStorage.
- [ ] Click **Push Now**.
- [ ] Go to Device 2. Click **Pull Latest**.
- [ ] Verify Device 2's local Pantry Planner is successfully cleared (tombstone pulled).

---

## 6. App Reset & Sign Out

- [ ] Go to Settings. Click **Clear App Data**.
- [ ] Verify the confirmation box warning text: *"This will reset local app data and sign out of cloud sync on this device. Remote backups are not deleted unless you use Delete Remote Data."*
- [ ] Click OK. Verify page reloads.
- [ ] After reload, verify a success toast appears: **"Signed out / Local-only mode restored."**
- [ ] Inspect localStorage: confirm sync config, queue, and database credentials are fully wiped.
