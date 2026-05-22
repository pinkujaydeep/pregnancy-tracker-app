# Pregnancy Tracker App

A mobile-first pregnancy care tracker built with React, Firebase, and Vite.

## What is now included

- Authentication: email/password + Google login
- Pregnancy profile setup with baseline clinical metadata
- Dashboard with pregnancy progress, checklist/water/medicine summaries, and upcoming appointment alert
- Trackers:
  - Daily checklist
  - Water intake
  - Medicines
  - Symptoms
  - Weight logs
  - Kick sessions
  - Contractions timer
  - Appointments
- Reports upload (Cloudinary) and secure links
- Reminder settings (browser notifications)
- Free background push setup via Firebase Cloud Messaging
- Emergency module:
  - Emergency caregiver and hospital contact details
  - One-tap call actions
  - Danger-sign quick reference
- Insights module:
  - Weight, symptom, and contraction trend charts
  - Doctor-visit PDF summary export
- Symptom triage engine:
  - Risk level tagging (low/moderate/high)
  - Emergency escalation prompt for high-risk patterns
- User controls:
  - Language selection
  - Theme modes (System / Light / Dark)
  - JSON data export for patient handover
- PWA support with service worker registration

## Tech stack

- React 19
- Vite 8
- Firebase Auth + Firestore + Storage SDK
- Bootstrap 5
- i18next / react-i18next

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project with Auth and Firestore enabled
- Cloudinary account and upload preset

## Environment setup

1. Copy `.env.example` to `.env`.
2. Fill Firebase keys using your production or staging project.
3. Add `VITE_FIREBASE_VAPID_KEY` to enable free browser background push.

Example:

```bash
cp .env.example .env
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Important product notes

- This app is a tracking and support tool, not a diagnostic medical device.
- Emergency UI provides guidance and contact shortcuts only.
- Free push uses Firebase Cloud Messaging. It is free to start and suitable for low to moderate usage.
- For production healthcare deployment, add:
  - Firestore security rules hardening
  - Audit logging and access control review
  - Data retention policy and legal consent workflow
  - Clinical governance sign-off for content

## Next recommended enhancements

- Role-based access for caregiver/partner view
- Secure report deletion from Cloudinary API (not only Firestore)
- In-app charts for symptom/weight trends
- Offline-first sync conflict handling
- Automated test suite (unit + integration + E2E)
