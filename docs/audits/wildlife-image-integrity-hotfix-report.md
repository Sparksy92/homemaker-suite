# Wildlife & Nature Image Integrity Hotfix Report

## 1. Root Cause Analysis
During Phased audits and field usability passes, we discovered two primary vulnerabilities:
1. **Wildlife Image Mismatch & Folder Separation Issues**:
   - Aquatic species and tracking entries were resolving their image paths incorrectly.
   - Vite production build assets for aquatic and tracking targets were stored in the general `public/images/wildlife` directory rather than dedicated folders, leading to path resolution mismatches between cards and details modals.
   - Broken, non-existent or duplicate image paths (e.g. `largemouth_bass_2.jpg`, `track_porcupine.jpg`) caused broken UI renderings (showing empty dark or blurred background blocks).
2. **Page Error Recovery Vulnerability**:
   - Any runtime error in the child routes or lazy-loaded pages would crash React completely, displaying only a blank layout shell or background without a recovery screen for users (e.g. when in the field with poor network connectivity).

---

## 2. Categories Audited & Actions Taken
We performed a full audit on the following categories in `wildlifeData.json`:
- **Flora**: Resolved to `/images/botany/...`
- **Insects**: Resolved to `/images/wildlife/...`
- **Fauna**: Resolved to `/images/wildlife/...`
- **Aquatic**: Resolved to `/images/aquatic/...`
- **Tracking**: Resolved to `/images/tracking/...`

---

## 3. Files Changed
- `app/src/utils/wildlifeImageResolver.js` [NEW] — Shared helper to sanitize images, resolve categories, and build absolute/relative paths.
- `app/src/pages/Wildlife.jsx` [MODIFY] — Integrated the shared resolver for list and modal views, showing `No verified image available` fallbacks on error, warning only in development, and lazy-loading background blur.
- `app/src/components/ImageCarousel.jsx` [MODIFY] — Standardized path resolution and lazy background blur on loaded state.
- `app/src/components/PageErrorBoundary.jsx` [NEW] — Class error boundary with Reload/Go Home controls and collapsible error logs in development.
- `app/src/App.jsx` [MODIFY] — Wrapped lazy-loaded routes inside `<PageErrorBoundary>`.
- `app/src/components/Layout.jsx` [MODIFY] — Wrapped `<Outlet />` inside `<PageErrorBoundary>`.
- `app/src/data/wildlifeData.json` [MODIFY] — Cleaned up missing image references (`largemouth_bass_2.jpg`, `track_porcupine.jpg`).
- `app/package.json` [MODIFY] — Added `npm run validate:wildlife-images` script.
- `app/scripts/validate-wildlife-images.js` [NEW] — Script that audits all image references prior to build/deploy.

---

## 4. Integrity Statistics
- **Total Species/Guides Scanned:** 100
- **Total Image References Scanned:** 101
- **Missing Image Files Fixed:** 2 (removed unverified `largemouth_bass_2.jpg` and `track_porcupine.jpg`)
- **Duplicates Found:** 0
- **Suspicious Mappings Found:** 0
- **Remaining Entries without Verified Image:** 1 (`track_porcupine`)

---

## 5. Test Coverage Added
- `app/src/utils/__tests__/wildlifeImageResolver.test.js` [NEW] — Tests categorizations, resolution paths, and image sanitization.
- `app/src/components/__tests__/PageErrorBoundary.test.jsx` [NEW] — Verifies catching rendering errors and displaying the Reload card.
- `app/src/components/__tests__/ImageCarousel.test.jsx` [MODIFY] — Updated with new fallback assertions.

---

## 6. Manual Vercel Verification Checklist
Before moving to production, verify the following on your Vercel preview deployment:
- [ ] `/#/wildlife` loads correctly without console errors.
- [ ] Flora images (e.g. Mulberry, Strawberry) resolve to `/images/botany/...` and match the species.
- [ ] Insect and Fauna images resolve to `/images/wildlife/...` and match the animals.
- [ ] Aquatic images (e.g. Largemouth Bass, Crayfish) resolve to `/images/aquatic/...` and match the species in both lists and modals.
- [ ] Tracking images resolve to `/images/tracking/...` and match the tracks.
- [ ] Card and modal images match identically for the same item.
- [ ] Missing images (e.g. Porcupine Track) display `"No verified image available"` text inside a camera card fallback (with no dark/blurred background visible).
- [ ] Triggering a test crash (e.g. by passing null prop to a page) renders the `"This page failed to load"` recovery card instead of a blank screen.
