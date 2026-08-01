'use client';

// Static alias for the customer profile so it works in the installed apps
// (Electron/Capacitor static export), where the dynamic `/customers/[id]` route is
// stripped from the build. Opened as `/customers/view/?id=<customerId>` — the shared
// profile component reads the id from the query string. Web keeps using `/customers/[id]`.
//
// The shared component calls useSearchParams(), which in a static export must sit
// inside a <Suspense> boundary, so we wrap it here.
import { Suspense } from 'react';
import CustomerDetail from '../_profile/CustomerProfile';

export default function CustomerProfileAlias() {
  return (
    <Suspense fallback={null}>
      <CustomerDetail />
    </Suspense>
  );
}
