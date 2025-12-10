# Look-Quick (Quick Red Tech)

A simple, Firebase-backed social feed scaffold for Look-Quick.

Quick start

1. Install Firebase CLI: `npm i -g firebase-tools`
2. Initialize project and connect to your Firebase project: `firebase login` then `firebase init` (select Hosting, Firestore, Storage)
3. Replace `src/js/firebase.js` config with your app's config
4. Deploy: `firebase deploy --only hosting`

Files created

- `public/` — static pages (index, login, register, profile, create-post)
- `src/js/` — Firebase init and basic auth/feed/create-post handlers
- `src/css/main.css` — base styles
- `firestore.rules` — starter security rules
- `firebase.json`, `.firebaserc` — hosting config

Next steps

- Wire up client-side routing/UX improvements
- Harden Firestore rules and add tests
- Add Cloud Functions for counters/notifications

© 2025 Quick Red Tech. Look-Quick is a product of Quick Red Tech.