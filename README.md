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
3. Run the app:
   `npm run dev`

## Production follow-ups

- Add a server-side payment verification endpoint (Razorpay webhook + signature verification).
- Build admin tooling for managing catalog content and service areas.
- Implement automated migration scripts to seed Firestore from a CSV upload.
