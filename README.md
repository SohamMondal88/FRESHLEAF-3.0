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

### Auto-seed products to Firestore

- The app now includes your provided fruits + vegetables catalog in `data/seedProducts.ts`.
- Set `VITE_AUTO_SEED_PRODUCTS=true` for first run/deploy to auto-upload seed products when `products` collection is empty.
- After data is seeded, set it back to `false` (or remove) to prevent unnecessary seed checks.

