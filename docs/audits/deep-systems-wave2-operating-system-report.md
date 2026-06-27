# Deep Systems Operating System Integration Audit Report

This document reports on the design choices, formulas, and integration architecture used to build the personalized Homestead Operating System, the planning engines, and the printable Field Binder exporter in Wave 2.

---

## 1. Architectural Architecture & Data Persistence

The Homestead OS is built to function fully client-side and offline-first. The user data resides completely inside local storage keys under a strict allowlist.

### LocalStorage Schema Allowlist
We configured and allowed 8 main storage keys:
1. `homemaker_homestead_plan`: Main household profile data (Household size, Region, Water setup, Pantry days, Energy type, Sanitation type).
2. `homemaker_garden_plan`: Frost windows settings, list of garden beds, and selected crops.
3. `homemaker_pantry_plan`: Calorie calculations parameters, categorized food stockpile targets, and rotation schedules.
4. `homemaker_water_plan`: Consumption limits, drum recommendations, rain catchment sizing parameters.
5. `homemaker_energy_plan`: Daily Wh electrical loads table, solar array and battery bank models.
6. `homemaker_build_projects`: Project progress trackers instantiated from blueprints.
7. `homemaker_seasonal_tasks`: Dynamic seasonal checklists.
8. `homemaker_field_binder_settings`: Printed section selection flags.

---

## 2. Planning Engines & Calculation Formulas

### A. Garden & Crop Planner (`gardenPlanner.js`)
*   **Frost Window Lookup**: Determines spring and fall dates to schedule planting actions.
*   **Bed Space Capacity**: Calculates total square footage from beds ($Width \times Length$), and estimates maximum crop capacity based on square-foot gardening guidelines:
    $$\text{Max Plants} = \text{Allocated Area} \times \text{Plants per Sq Ft}$$
*   **Planting Calendar**: Generates indoor starting, transplanting, and direct sowing timings relative to frost window bounds.

### B. Pantry & Storage Planner (`pantryPlanner.js`)
*   **Calorie-to-Weight Models**: Estimates weight demands across 5 key food categories based on survival target calories ($HouseholdSize \times Days \times CalPerPerson$):
    - **Grains/Starches (40%)**: 1,600 kcal/lb
    - **Proteins/Legumes (25%)**: 1,500 kcal/lb
    - **Fats/Oils (15%)**: 4,000 kcal/lb
    - **Dried Fruits/Sugars (10%)**: 1,200 kcal/lb
    - **Vegetables (10%)**: 300 kcal/lb
*   **Volume Estimation**: Estimates storage space in cubic feet ($TotalWeight \times 0.022\text{ cu ft/lb}$) and standard 5-shelf metal wire racks ($Volume / 15$).

### C. Water Systems Planner (`waterPlanner.js`)
*   **Reserve Buffer Sizing**: Calculates daily potable volume:
    $$\text{Daily Volume} = \text{HouseholdSize} \times \text{GallonsPerPerson}$$
    $$\text{Reserve Goal} = \text{Daily Volume} \times \text{BufferDays}$$
*   **Rain Runoff Catchment**: Computes harvesting potential from roof area:
    $$\text{Runoff Gallons} = \text{RoofArea} \times \text{RainfallInches} \times 0.6233 \times \text{RunoffEfficiency}$$

### D. Energy & Power Planner (`energyPlanner.js`)
*   **Daily Load Summation**: Accumulates Watt-hours draw:
    $$\text{Total Daily Wh} = \sum (\text{ApplianceWatts} \times \text{HoursPerDay})$$
*   **Solar PV Sizing**: Estimates panel capacity target:
    $$\text{Solar Watts} = \frac{\text{Total Daily Wh}}{\text{Peak Sun Hours}} \times 1.25\text{ loss multiplier}$$
*   **Battery Sizing**: Estimates bank capacity:
    $$\text{Battery Ah} = \frac{\text{Total Daily Wh} \times \text{Autonomy Days}}{\text{System Voltage} \times \text{Depth of Discharge (LiFePO4/Lead)}}$$

---

## 3. High-Contrast Printable Field Binder Exporter

`FieldBinder.jsx` translates active planning state models into structured, clean black-and-white printable views:
*   Uses `@media print` style overrides to hide navigation headers and render high-contrast borders.
*   Contains section selector toggles, clipboard copy functions, checkboxes, and prominent safety disclaimers for botulism and DC wiring surges.
