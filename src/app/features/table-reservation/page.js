import TableReservationClient from './TableReservationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Table Reservation System for Restaurants | DineOpen',
  description: 'Accept online table bookings 24/7, manage waitlists, and reduce no-shows with automated reminders. Visual floor plans and real-time availability.',
  keywords: 'table reservation system, restaurant booking software, online table booking, waitlist management, restaurant reservation management',
  openGraph: {
    title: 'Table Reservation System | DineOpen',
    description: 'Accept online bookings 24/7, manage waitlists, and reduce no-shows with automated reminders.',
    url: 'https://www.dineopen.com/features/table-reservation',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Table Reservation System | DineOpen',
    description: 'Accept online bookings 24/7, manage waitlists, and reduce no-shows with automated reminders.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/features/table-reservation',
  },
};

export default function TableReservationPage() {
  return <TableReservationClient />;
}
