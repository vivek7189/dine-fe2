import TableManagementClient from './TableManagementClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Table Management Software India | DineOpen',
  description: 'Digital table management for restaurants. Visual floor plan, real-time status, table assignments, reservations. Know which tables are free, occupied, or billing.',
  keywords: 'restaurant table management India, table booking software, floor plan restaurant, table status tracking, restaurant seating software, table reservation system',
  openGraph: {
    title: 'Free Restaurant Table Management Software India | DineOpen',
    description: 'Digital table management with visual floor plan and real-time status tracking.',
    url: 'https://www.dineopen.com/tools/table-management',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/table-management',
  },
};

export default function TableManagementPage() {
  return <TableManagementClient />;
}
