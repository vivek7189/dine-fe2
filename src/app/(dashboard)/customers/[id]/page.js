'use client';

// Web route for a customer's profile: /customers/<id>.
// The actual UI lives in the shared, non-dynamic `_profile/CustomerProfile` module so
// the installed apps (Electron/Capacitor) — whose static-export build strips dynamic
// `[param]` route folders — can render the same profile via `/customers/view/?id=<id>`.
export { default } from '../_profile/CustomerProfile';
