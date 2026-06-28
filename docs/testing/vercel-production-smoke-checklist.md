# Vercel Production Smoke Checklist

Use this checklist to perform smoke tests on the production deployment to verify Vercel configurations and routing behavior.

---

## 1. Deep-Link Handling & SPA Rewrites
- [ ] Deploy the app using `npm run deploy:vercel`.
- [ ] Navigate directly to a sub-route URL (e.g. `https://your-domain.vercel.app/settings`).
- [ ] Verify the server rewrites the route to `index.html` and loads the React Router app without returning a `404 Not Found`.

---

## 2. HTTPS & Security Headers
- [ ] Access the site over HTTP. Verify it redirects automatically to HTTPS.
- [ ] Audit the security headers (e.g. click lock icon next to the URL) to verify standard HSTS and browser security properties.

---

## 3. Supabase Integration & CORS
- [ ] Open the DevTools console.
- [ ] Turn on cloud backup sync.
- [ ] Verify that Supabase network requests (select, upsert) complete successfully with status `200` / `201` and do not trigger CORS preflight block errors.
