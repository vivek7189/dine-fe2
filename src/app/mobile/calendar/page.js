'use client';

import dynamic from 'next/dynamic';

// dine-app WebView: the same Event Calendar page as the dashboard, without the sidebar
// (the /mobile layout strips it). Reached from the Home "Upcoming events" card.
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

const CalendarPage = dynamic(() => import('../../(dashboard)/calendar/page'), { ssr: false });

export default function MobileCalendarPage() {
  return <CalendarPage />;
}
