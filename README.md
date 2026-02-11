<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/165D9YvGQYBu7jjGWQMLMDx6Ie-nxxhfy

## Run Locally

**Prerequisites:** Node.js, Firebase project + Firestore enabled


1. Install dependencies:
   `npm install`
2. Create a `.env.local` (or `.env`) file with:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPPORT_PHONE`
   - `VITE_AUTO_SEED_PRODUCTS` (`true` once to auto-seed provided fruits/vegetables)
   - `RAZORPAY_KEY_ID` (server)
   - `RAZORPAY_KEY_SECRET` (server)
   - `RAZORPAY_WEBHOOK_SECRET` (server)
   - `FIREBASE_PROJECT_ID` (server)
   - `FIREBASE_CLIENT_EMAIL` (server)
   - `FIREBASE_PRIVATE_KEY` (server)
3. Run the app:
   `npm run dev`

## Production follow-ups

- Add a server-side payment verification endpoint (Razorpay webhook + signature verification).
- Build admin tooling for managing catalog content and service areas.
- Implement automated migration scripts to seed Firestore from a CSV upload.

## Firebase Auth production checklist

- Enable **Email/Password** and **Phone** sign-in providers in Firebase Console.
- Enable **Google** sign-in provider in Firebase Console (for "Continue with Google").
- Add your real domain to **Authentication → Settings → Authorized domains**.
- Keep `VITE_FIREBASE_AUTH_DOMAIN` aligned with the same Firebase project.

## Bulk Firestore import (products/farmers/blogPosts/testimonials)

1. Create a JSON file (example: `data/firestore-seed.json`) like:
```json
{
  "products": [{ "id": "p-1", "name": {"en":"Apple","hi":"सेब","bn":"আপেল"}, "price": 120, "image":"...", "gallery":["..."], "category":"Fruit", "description":"...", "inStock": true, "rating": 4.8, "reviews": 120, "baseUnit":"kg" }],
  "farmers": [{ "id": "f-1", "name": "Farmer 1", "farmName":"Green Farm", "location":"Nashik", "description":"...", "avatar":"...", "coverImage":"...", "certifications":["Organic"], "joinedDate":"2024-01-01", "rating":4.7 }],
  "blogPosts": [],
  "testimonials": []
}
```
2. Run: `node scripts/import-firestore.mjs data/firestore-seed.json`

### Auto-seed products to Firestore (your provided fruits + vegetables)

The website is already configured to upload the large product list automatically from `data/seedProducts.ts` into Firestore `products`.

#### One-time setup steps (manual)
1. Open your Firebase Console → Firestore Database.
2. Make sure collection **`products`** is empty (or rename old data if you want a fresh replace).
3. In your deployment/project env vars, set:
   - `VITE_AUTO_SEED_PRODUCTS=true`
   - All `VITE_FIREBASE_*` vars for the same Firebase project.
4. Deploy the app (or run locally with the same env vars).
5. Open the website once. `ProductContext` will detect empty `products` and batch-write all seed items.
6. Verify in Firebase Console that documents like `f-1`, `f-2`, ..., `v-54` appear under `products`.
7. Set `VITE_AUTO_SEED_PRODUCTS=false` (or remove it) and redeploy to disable future auto-seed checks.

#### Payment env setup (where to put Razorpay key)

- Put keys in your hosting env vars (Vercel/Netlify), not in code files.
- Frontend env:
  - `VITE_RAZORPAY_KEY_ID` = Razorpay Key ID (public).
- Server/API env:
  - `RAZORPAY_KEY_ID` = same Key ID.
  - `RAZORPAY_KEY_SECRET` = Razorpay Key Secret (private).
  - `RAZORPAY_WEBHOOK_SECRET` = webhook secret from Razorpay dashboard.

If checkout shows **"Unable to create payment order"**, it almost always means server env vars are missing or incorrect (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`).

#### Important notes
- The app can only seed into the Firebase project referenced by your current `VITE_FIREBASE_*` config.
- If Firestore rules block writes, temporarily allow admin write (or use admin account) for initial seeding.
- This process is idempotent with `merge` writes, but keep `VITE_AUTO_SEED_PRODUCTS` off after first successful seed in production.
