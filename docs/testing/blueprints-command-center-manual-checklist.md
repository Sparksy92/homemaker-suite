# Manual Verification Checklist — Blueprints & Command Center

Follow this step-by-step checklist to manually test and verify all new features.

---

## 1. Builds & Projects Planner Page
1. Open the app and navigate to the **Builds & Projects** page (`/homestead/build-projects`).
2. Verify that the **Project Blueprints Library** renders exactly 6 initial blueprint cards.
3. Verify that the search bar is present. Type `"rain"` and check if only rain/water catchments are shown.
4. Clear search, then click the **Water** category pill. Verify only water-related blueprints remain.
5. Click on any card (e.g., **Gravity-Fed Rain Barrel Stand**). Verify the detail modal opens, showing:
   * Title, Category, Difficulty, Safety, and Estimated Time.
   * A summary paragraph.
   * Bulleted Materials and Tools lists.
   * Multi-step milestone preview.
   * Safety warnings.
6. Click **Add to Active Builds** in the modal.
   * Confirm the modal closes.
   * Confirm a success message toast is shown.
   * Confirm the project appears in the left **Active Builds List** sidebar.
7. Click the new project in the sidebar to load details.
8. Click one of the steps to toggle completion. Check if progress bar updates.
9. Click the **Load More Blueprints** button at the bottom of the library when all are listed to confirm pagination works.
10. Simulate offline mode (e.g. Chrome DevTools Dev Offline) and reload. Verify the card library displays:
    * `"Offline blueprint fallback loaded."` notification badge.
    * The fallback templates (Raised Bed, Compost Bin, etc.) correctly render without crashing.

---

## 2. Homestead Command Center Page
1. Navigate to the **Homestead Command Center** (`/homestead`).
2. Confirm the **Homestead Profile** summary card shows a tidy 6-metric grid with icons.
3. Confirm the **System Readiness** card shows color-coded progress bars for Water, Food, Energy, and Garden.
4. Inspect the **Today's Operating Checklist**:
   * Verify it displays imported seasonal tasks (e.g., in Winter: "Clear solar panels of snow").
   * Toggle a task complete. Verify the checkbox fills, the text gains strike-through styling, and the progress bar updates.
   * Click **Add Task** to open the inline creator.
   * Fill out the Title (e.g. "Water orchard seedlings"), choose "Water" system, and click **Add Task**.
   * Verify the custom task appears at the bottom.
   * Verify custom tasks render a Trash can icon. Click the trash can to delete the custom task, verifying it removes from local storage and the UI.
   * Click **Completed** tab filter. Confirm only completed tasks show. Click **Active** to filter back.
5. Verify the **Active Build Projects** list shows:
   * Progress percentage.
   * Next step summary (e.g., "Next: Cut lumber").
   * Next Step action button (advances step completion).

---

## 3. Botany Image Integrity Check
1. Go to the **Wildlife & Foraging** page (`/wildlife`).
2. Navigate to the **Botany/Flora** guides section.
3. Inspect **Wild Mustard**:
   * Confirm the image is a yellow wildflower plant, not a starfish.
4. Inspect **Maple Tree**:
   * Confirm the image is a deciduous maple tree/leaves, not a maple syrup bottle.
5. Inspect **Black Walnut**:
   * Confirm the image is a compound leafy branch with green walnut fruits.
