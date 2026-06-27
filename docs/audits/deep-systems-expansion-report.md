# Deep Systems Expansion Wave 1: Technical Audit & Delivery Report
**Date:** 2026-06-27  
**Status:** Completed & Validated  
**Target:** Sparksy92/homemaker-suite (React PWA app)

---

## 1. Executive Summary

This expansion transitions the Homemaker Suite PWA from a basic reference list into a tailored, visual-first homesteading operating manual. The focus has been content depth, safety disclaimers, data integrity, and personalization.

---

## 2. Personalization & Onboarding Mechanics

* **State Persistence**: Exposed `homemaker_homestead_profile` in `UserContext.jsx` and added it to the `LOCAL_STORAGE_ALLOWLIST` in `appDataService.js`.
* **Onboarding Wizard**: Built `HomesteadOnboarding.jsx` as a responsive, multi-step card questionnaire that captures household size, region/climate zones, water sources, dry buffers, energy setups, and skill levels.
* **Dismissibility**: Allowed users to "Skip Setup" or exit the onboarding flow. If skipped, `skipped: true` is persisted.
* **Context-Driven Discovery**: Replaced hardcoded placeholders in `Library.jsx`'s `recommendedGuides` section:
  * Water score low -> Recommends *Water Procurement* and *Bio-Sand Filtration*.
  * Food score low -> Recommends *Long Term Storage* and *Pressure Canning*.
  * Garden score low -> Recommends *Soil Health* and *Garden Planning*.
  * Energy score low -> Recommends *Solar & Passive Energy*.
  * Uncompleted/Skipped onboarding -> Prompts a prominent profile setup button.

---

## 3. Reusable SVG Diagrams & Visual Components

Vector diagrams designed with Earthy theme styles have been modularized in `app/src/components/visual-guides/diagrams/`:
1. **`SunPathDiagram.jsx`**: Seasonal winter vs. summer solar angle clearance and overhang limits.
2. **`RainCatchmentDiagram.jsx`**: Gutters, leaf screens, first-flush diverter ball seals, and opaque cisterns.
3. **`RaisedBedLayoutDiagram.jsx`**: Organic Hugelkultur cross-section layers (logs, twigs, compost, soil, mulch).
4. **`SimpleSolarSystemDiagram.jsx`**: Electrical panel loops, charge controller screens, fuses, and inverters.
5. **`RootCellarAirflowDiagram.jsx`**: Cool low air intake vs. warm high exhaust draft routes.
6. **`CompostLayerDiagram.jsx`**: C:N ratio piling (brown carbon vs. green nitrogen).

---

## 4. Custom Landing Hubs & Multi-Folder Wiring

Four custom, visual landing page components replaced standard folders:
* **Shelter Landing (`ShelterLanding.jsx`)**: R-value comparisons, foundation tables, site orientation checklists, framing guides, and project cards.
* **Preservation Landing (`PreservationLanding.jsx`)**: Safety preservation tables, root cellar principles, rotation guides, and an **Interactive Pantry Target Calculator** (labeled as an estimator). Routes all of `1 Pantry Systems`, `4 Food Storage & Pantry`, and `4 Preservation`.
* **Health & Sanitation (`HealthSanitationLanding.jsx`)**: Emergency first-aid triage, medical kits, composting toilet lists, and handwashing. Routes `14 Health & First Aid`.
* **Tools & Workshop (`ToolsRepairLanding.jsx`)**: Maintenance timelines, axe/leak/washer repairs, and tool lists. Routes `16 Tools & Workshop`, `10 Tools & Wizards`, and `50 Interactive Tools`.

---

## 5. Reference Database Expansions

* **Gardening (`gardening_crop_profiles.json`)**: Expanded from 10 to 30 crops (adding Peas, Corn, Squash, Pumpkin, Cucumber, Cabbage, Broccoli, Kale, Beets, Turnips, Radish, Herbs, Chamomile, Calendula, Comfrey, Yarrow, etc.) with companion details.
* **Energy (`energy_system_reference.json`)**: Added Gel and Flooded lead-acid batteries, Starlink dish consumption, deep well pumps, and heating space warnings.
* **Water (`water_system_reference.json`)**: Expanded to ceramic filters, hollow fiber membranes, reverse osmosis, solar stills, SODIS, IBC totes, and indoor cistern specifications.
* **Data Provenance**: Added `provenance` metadata to all reference JSON files detailing source, review date, and safety auditing values.

---

## 6. Safety Audit & Legal Protection

All hubs contain visible, bold warning callouts:
1. **Construction**: *Non-engineered building advice; verify local code.*
2. **Electrical**: *DC and AC wiring carry shock and fire hazard warnings; install fuses.*
3. **Food Preservation**: *Canning low-acid foods incorrectly poses botulism risk; follow USDA times.*
4. **Water**: *Raw runoff contains pathogens; treat, verify, and test.*
5. **First Aid**: *Educational reference; does not replace physician care.*

---

## 7. Next Waves Scope Boundaries

* **Wave 1 (Delivered)**: Basic systems layout, interactive components, 30 crop database, first-flush/ventilation/solar schematics, onboarding flows.
* **Wave 2 (Future)**: Detailed cabin blueprint guides, orchards, livestock, hunting/fishing legalities, regional planting calendars, offline image packs, and printable templates.
