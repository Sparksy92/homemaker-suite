# Manual Testing Checklist — Homestead Operating System Integration

This checklist outlines the manual tests required to verify calculators, state persistence, layout designs, and printable binder outputs.

---

## 1. Onboarding & Global State Persistence
- [ ] **First-Run Prompt**: Clear browser cache or use a private window. Verify the floating Onboarding Gate card appears at the bottom.
- [ ] **Setup Action**: Click "Set up now". Verify the 5-step profile wizard modal opens.
- [ ] **Postpone Action**: Click "Remind me later". Refresh the page. Verify the prompt does not reappear in the same browser session.
- [ ] **Skip Action**: Click "Skip for now". Verify the Homestead Profile card in the Command Center indicates "Needs setup".
- [ ] **Defaults Loading**: Complete the profile wizard. Open the Garden, Pantry, or Water planners and verify the "Pull Profile Defaults" buttons load your exact inputs.

---

## 2. Planners Functional Validation

### A. Garden & Crop Planner (`/homestead/garden-plan`)
- [ ] Add a custom raised bed (Width: 4 ft, Length: 8 ft, Depth: 12 in). Verify total area recalculates to 32 sq ft.
- [ ] Select Tomato and Lettuce crops. Verify crop calendar dates populate relative to spring/fall dates.
- [ ] Verify maximum capacity estimates display based on spacing values (e.g. 1 per sq ft for tomatoes).
- [ ] Verify the SVG bed layout vector diagram renders correctly.

### B. Pantry & Storage Planner (`/homestead/pantry-plan`)
- [ ] Input 4 people for 90 days. Verify grain/starch target displays ~225 lbs.
- [ ] Verify estimated volume displays ~9.9 cu ft and required rack numbers adjust accordingly.
- [ ] Check off rotation items (e.g., label cans, record expiry dates). Verify checkboxes retain their state on refresh.
- [ ] Read the botulism warnings block. Verify it is prominently visible.

### C. Water Systems Planner (`/homestead/water-plan`)
- [ ] Input 4 people for 90 days. Verify daily potable consumption target is 8 Gallons and storage target is 720 Gallons.
- [ ] Run rain catchment estimator: Roof: 1500 sq ft, Rain: 1 inch. Verify harvest potential estimates ~834 gallons.
- [ ] Verify the gravity catchment schematic diagram displays.

### D. Energy & Power Planner (`/homestead/energy-plan`)
- [ ] Add a light load: 20W bulb for 5 hours. Verify daily load updates to 100 Wh.
- [ ] Add a heavy water pump load: 1200W for 1 hour. Verify red "Heavy load surge" warning alert displays.
- [ ] Sizing check: Verify battery capacity Ah scales proportionally when switching between 12V and 24V options.
- [ ] Verify the solar system schematic diagram displays.

### E. Builds & Projects Page (`/homestead/build-projects`)
- [ ] Click "Add to Active Builds" on the "Compost Bin" card. Verify the bin project populates under "Active Builds".
- [ ] Open the compost bin detail sheet. Check off "Select site". Verify the progress bar updates to 20% completion.
- [ ] Create a custom blueprint project. Input name, tools, materials, and steps (one per line). Verify it saves and can be active.

---

## 3. Exporter & Printing Exporter (`/field-binder`)
- [ ] Open the binder exporter. Toggle off "Energy" and "Projects". Verify those sections vanish from the view.
- [ ] Click "Print Binder". Verify the browser print dialog displays a clean black-and-white grid layout without sidebars or buttons.
- [ ] Click "Copy Summary". Paste into notepad. Verify profile values, water numbers, and active projects copy correctly.
