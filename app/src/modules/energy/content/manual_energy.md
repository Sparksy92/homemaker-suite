# Survival Manual: Off-Grid Energy
**Version:** 1.0 (Survival Edition)
**Domain:** Electrical Engineering / Thermodynamics
**Complexity:** Medium/High (Shock Risk)
**Dependency:** Shelter, Tools

---

## 1. Safety First (DC vs AC)
*   **DC (Direct Current):** 12V / 24V / 48V. Battery power. Generally safer (12V won't kill you unless you stick a fork in it). High amperage can cause arcs/fire.
*   **AC (Alternating Current):** 110V / 220V. House power. **DEADLY.** Do not touch live wires.
*   **Inverters:** Change DC to AC. High voltage output. Treat output like grid power.

---

## 2. Solar Systems (Photovoltaic)

### 2.1 The Components
1.  **Panels:** 100W, 200W, 400W. (Monocrystalline > Polycrystalline).
2.  **Charge Controller:** Brains. Prevents battery overcharge.
    *   *MPPT:* 30% more efficient. Expensive.
    *   *PWM:* Cheap. Bulletproof. Less efficient.
3.  **Battery Bank:** Storage. (See Section 3).
4.  **Inverter:** DC -> AC. (Pure Sine Wave > Modified Sine Wave for electronics).

### 2.2 Sizing a Survival System (Example)
*   **Goal:** Keep a 12V fridge, lights, and radio running. (~1000Wh per day).
*   **Solar Needed:** 1000Wh / 5 sun hours = 200W panel (Minimum).
    *   *Safety Factor:* Double it. **400W Solar Array.**
*   **Battery Needed:** 1000Wh / 12V = 83Ah.
    *   *Depth of Discharge (DoD):* Lead Acid only usable to 50%.
    *   *Bank Size:* **200Ah 12V Battery Bank.**

### 2.3 Wiring
*   **Series:** Volts add up (12V + 12V = 24V). Amps same. Good for long wire runs.
*   **Parallel:** Amps add up (100Ah + 100Ah = 200Ah). Volts same. Good for 12V native systems.

---

## 3. Battery Chemistry (The Tank)

### 3.1 Lead Acid (Flooded / FLA)
*   **Pros:** Cheap, recyclable, robust. Can be revived (desulfated).
*   **Cons:** Heavy, deadly fumes (needs ventilation), liquid maintenance (distilled water), only 50% usable capacity.
*   **Life:** 3-5 years (if maintained).

### 3.2 AGM / Gel (Sealed Lead Acid)
*   **Pros:** No maintenance, mount sideways, no spill.
*   **Cons:** Careful charging required (can't boil them).
*   **Life:** 5-7 years.

### 3.3 LiFePO4 (Lithium Iron Phosphate)
*   **The Survival King.**
*   **Pros:** 100% usable capacity. 2000-5000 cycles (10+ years). Lightweight. Very safe (won't explode like Lipo).
*   **Cons:** Expensive upfront. Cannot charge below freezing (0°C).
    *   *Solution:* Keep batteries inside living space.

---

## 4. Generators (Fossil Fuel)

### 4.1 Inverter Generators (Honda EU series)
*   **Pros:** Quiet, fuel efficient (eco throttle), clean power.
*   **Cons:** Electronics can fail.
*   **Role:** Battery charger during storms.

### 4.2 Old Iron (Construction Generators)
*   **Pros:** Fixable. Robust.
*   **Cons:** Loud. Eat gas. Dirty power.

---

## 5. Fuel Storage & Stabilization

Fuel goes bad. "Bad gas" gums up carburetors.
### 5.1 Gasoline
*   **Shelf Life:** 3-6 months.
*   **Stabilizer (Pri-G / Sta-Bil):** Extends to 1-2 years.
*   **Warning:** Ethanol blends absorb water from air (phase separation). Store Non-Ethanol only if possible.
*   **Rotation:** Use oldest first.

### 5.2 Diesel
*   **Shelf Life:** 1-2 years.
*   **Issues:** Algae growth. Gelling in winter.
*   **Additive:** Biocide + Anti-Gel.
*   **Storage:** Opaque (stop light/algae). Cool.

### 5.3 Propane
*   **Shelf Life:** Indefinite (Tank rust is only enemy).
*   **The Best:** Can run generators, heaters, stoves.
*   **Safety:** Heavier than air. Leaks pool on floor. Boom. Ventilate low.

---

## 6. Manual & Alternative Power

### 6.1 Wind Turbines
*   **Reality Check:** Cheap eBay turbines don't work. You need high towers (30ft+) and clean air.
*   **Moving Parts:** Maintenance nightmare in storms.
*   **Role:** Good supplement in winter when sun is low but wind is high.

### 6.2 Micro-Hydro
*   **The Holy Grail:** If you have a stream with "Head" (drop).
*   **Power:** 24/7/365. 100W hydro > 500W solar.
*   **Setup:** Intake pipe -> Penstock (Pipe) -> Turbine -> Tailrace.

### 6.3 Bike Generator
*   **Reality:** Humans output ~100W sustainbly.
*   **Effort:** 10 hours pedaling = 1kWh (10 cents of electricity).
*   **Usage:** Boosting batteries for radio comms. Not for fridges.

---

## 7. Thermal Regulation (Heating/Cooling)

Energy isn't just electricity. It's keeping warm.

### 7.1 Wood Stoves
*   **Rocket Mass Heater:** Burns twigs/small wood hot and clean. Exhaust passes through thermal mass bench (cob/mud). Heats for hours after fire is out.
*   **Sizing:** Too big = sweating/creosote. Too small = freezing.

### 7.2 Passive Solar
*   **South Facing Windows:** Let winter sun in.
*   **Thermal Mass:** Concrete floor/water barrels absorb heat. Release at night.
*   **Insulation:** The best "heater" is good insulation.

### 7.3 Coolgardie Safe (Evaporative Fridge)
*   **Design:** Wooden frame covered in hessian/burlap. Water drips onto cloth. Breeze evaporates water, cooling inside.
*   **Requirement:** Dry air.
*   **Effect:** Keeps stored food 10-20°F below ambient.

---

## 8. Projects & Builds

### 8.1 Project: The "Ammo Can" Solar Generator
**Goal:** A portable, waterproof power station for charging comms, lights, and phones.
**Components:**
1.  **.50 Cal Ammo Can:** (Steel provides robust protection).
2.  **Battery:** 12V 12Ah-20Ah LiFePO4 (Fits perfectly inside).
3.  **Charge Controller:** PWM 10A or 20A (Flush mount recommended).
4.  **Outputs:** Dual USB Sockets, 12V Cigarette Socket, Binding Posts (for radio).
5.  **Protection:** In-line Fuse holder (20A) or 6-way Fuse Block.
6.  **Master Switch:** Marine Toggle Switch.
7.  **Input:** Anderson Powerpole connectors (Panel mount).

**Step-by-Step Build:**
1.  **Layout:** Apply masking tape to the side of the can. Trace outlines of the Controller, Sockets, and Switch.
2.  **Cut & Drill:**
    *   Use a Step Bit for round holes (switches, sockets).
    *   Use a Dremel/Jigsaw for the rectangular Controller hole.
    *   *Safety:* Wear eye protection. De-burr edges with a file.
3.  **Mounting:** Install components. Use rubber gaskets/silicone to maintain water resistance.
4.  **Wiring (The Safety Loop):**
    *   **Battery (+)** -> **Fuse** -> **Master Switch** -> **Fuse Block (+)**.
    *   **Battery (-)** -> **Bus Bar / Common Ground**.
    *   *Note:* Do not connect the battery yet.
5.  **Connecting Components:**
    *   Run wires from Fuse Block to each component (USB, Controller, Sockets).
    *   **Solar Input:** Wire Anderson Powerpoles to the "PV" terminals on the Controller.
6.  **Final Hookup:**
    *   Connect Battery (+) and (-) to the system.
    *   Turn Master Switch ON. The Charge Controller should light up.
    *   Test Solar Input with a panel.

### 8.2 Skill: Crimping MC4 Connectors
**Context:** MC4s are the universal waterproof connectors for solar panels. You must know how to replace them.
**Tools:** MC4 Crimping Tool, Wire Strippers.
**The Wiring Standard:**
*   **Male Pin:** Goes on the **Negative (-)** Cable. Inserts into the **Female Housing**.
*   **Female Pin:** Goes on the **Positive (+)** Cable. Inserts into the **Male Housing**.
*   *Yes, it's confusing. The "Gender" refers to the metal pin, not the plastic housing.*

**Process:**
1.  **Strip:** Expose 1/2 inch (12mm) of bare wire.
2.  **Crimp:** Place the pin in the crimper. Insert wire. Squeeze until ratchet releases. Pull test (it should not come off).
3.  **Insert:** Push the crimped pin into the plastic housing until you hear a distinct **"CLICK"**.
4.  **Seal:** Screw on the compression nut. Hand tight + 1/2 turn with a wrench.

### 8.3 Project: The Faraday Cage
**Goal:** Protect backup electronics (Spare Inverter, Charge Controller, Radios) from EMP/CME.
**Principle:** A continuous conductive shield blocks electromagnetic fields.
**Materials:** Galvanized Steel Trash Can (with tight lid), Cardboard, Aluminum HVAC Tape.

**Build:**
1.  **Insulation Layer:** Line the *entire* interior (bottom and sides) with cardboard.
    *   *Critical:* The electronics MUST NOT touch the metal can directly.
2.  **Lid Prep:** Scrub the inside rim of the lid and the top lip of the can with steel wool to remove zinc/oxidation. We need raw metal-to-metal contact.
3.  **Loading:**
    *   Wrap each device in bubble wrap (Shock protection).
    *   Wrap that bundle in Aluminum Foil (First shield layer).
    *   Place inside the can.
4.  **Sealing:**
    *   Place lid on tight.
    *   Tape over the seam with Aluminum Tape to seal any gaps.
5.  **The Radio Test:**
    *   Turn on a portable FM radio to a strong station.
    *   Place it in the can.
    *   Put the lid on.
    *   If the signal cuts to static immediately, your shield is effective.

---

## 9. Troubleshooting
*   **System Dead?** Check the Fuse first. Then check Battery Voltage (>11V).
*   **Not Charging?** Check Panel polarity (Did you wire +/- backwards?). Check Sun angle.
*   **Inverter Beeping?** Low Voltage (Battery empty) or Overload (Too many appliances).

