# Deploying Your Homemaker App

Since we built this as a Progressive Web App (PWA), the best way to distribute it is via the web. This gives you:
1.  **Global Access:** Works on any device with a browser.
2.  **Instant Updates:** Push code -> Everyone gets the new version immediately.
3.  **App Experience:** Users can "Install" it to their home screen, and it looks just like a native app.

## Option A: Vercel (Recommended - Easiest)
*(Free for personal projects)*

1.  **Create a GitHub Repository:**
    *   Go to github.com and create a new repo called `homemaker-suite`.
    *   Upload your `app` folder contents to this repo.
2.  **Connect to Vercel:**
    *   Go to [vercel.com](https://vercel.com) and sign up.
    *   Click "Add New Project".
    *   Select your `homemaker-suite` repo.
    *   Set the **Root Directory** to `app` if deploying the entire repository.
    *   In the **Environment Variables** section, add:
        - `VITE_SUPABASE_URL`: Your Supabase Project API URL (e.g. `https://your-ref.supabase.co`).
        - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project anonymous key.
    *   Click "Deploy".
3.  **Done:** Vercel will give you a URL (e.g., `homemaker-suite.vercel.app`).
    *   Share this link.
    *   When you want to update, just commit changes to GitHub. Vercel automatically rebuilds and deploys.

## Option B: Netlify (Alternative)
*(Also free and excellent)*

1.  **Drag & Drop:**
    *   Run `npm run build` in your `app` folder (we just did this).
    *   This creates a `dist` folder.
    *   Go to [app.netlify.com/drop](https://app.netlify.com/drop).
    *   Drag the `dist` folder onto the page.
2.  **Done:** Netlify gives you a live URL instantly.

## How to "Install" on Phone
1.  Visit your new URL on your phone.
2.  **iOS:** Tap the "Share" button -> "Add to Home Screen".
3.  **Android:** Tap the menu dots -> "Install App".
