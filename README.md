<div align="center">

# Freshleaf 3.0

### A responsive grocery-commerce platform for a modern local shopping experience

[![Live demo](https://img.shields.io/badge/Live_Demo-Visit-16A34A?style=for-the-badge&logo=vercel&logoColor=white)](https://freshleaf-3-0.vercel.app/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase&logoColor=black)

</div>

## Overview

Freshleaf is a full-featured grocery shopping experience built with React and TypeScript. It combines a responsive storefront, Firebase-backed services, multilingual product data and server-side payment endpoints in a deployment-ready Vite application.

## Features

- Product discovery, search, categories and detailed product pages
- Cart, checkout and order-oriented flows
- Firebase authentication and Firestore integration
- Multilingual product content
- Admin-oriented catalog and content workflows
- PDF generation for customer-facing documents
- Progressive Web App assets and service worker
- Responsive mobile, tablet and desktop interface

## Stack

- React 19 and React Router
- TypeScript and Vite
- Firebase Authentication and Firestore
- Tailwind CSS
- Google Gen AI integration
- Vercel serverless API routes
- Razorpay integration hooks

## Local setup

### Prerequisites

- Node.js 20 or newer
- A Firebase project with Authentication and Firestore enabled

```bash
git clone https://github.com/SohamMondal88/FRESHLEAF-3.0.git
cd FRESHLEAF-3.0
npm install
cp .env.example .env.local
npm run dev
```

If `.env.example` is not yet present, create `.env.local` locally with only the variables needed for your configuration. Never commit real credentials.

### Environment variables

Client-side variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_RAZORPAY_KEY_ID
VITE_GEMINI_API_KEY
VITE_SUPPORT_PHONE
VITE_AUTO_SEED_PRODUCTS
```

Server-only variables:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

Set server secrets in the hosting provider's encrypted environment settings. Do not prefix private secrets with `VITE_`, because Vite exposes those values to client bundles.

## Commands

```bash
npm run dev       # local development
npm run build     # production build
npm run preview   # preview the production build
```

For Vercel serverless routes under `/api`, use a deployed environment or `vercel dev`.

## Firebase checklist

- Enable the required Authentication providers.
- Add the production domain to Firebase authorized domains.
- Deploy restrictive Firestore rules.
- Keep automatic data seeding disabled after initial setup.
- Verify payment orders and signatures on the server.

## Security

No real `.env` files should be committed. If a credential was ever committed, removing the file from the latest branch is not enough: rotate the credential immediately and consider purging it from Git history.

## Contributing

Issues and focused pull requests are welcome. Please avoid committing generated build output, personal data or credentials.

## Author

Built by [Soham Mondal](https://github.com/SohamMondal88).

