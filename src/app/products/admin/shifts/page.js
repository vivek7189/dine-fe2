import ShiftsClient from './ShiftsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Shift Scheduling Software | Staff Scheduling | DineOpen',
  description: 'Restaurant shift scheduling with drag-and-drop assignment, shift templates, attendance tracking, swap requests, and payroll hour calculation. Schedule staff across multiple locations.',
  keywords: 'restaurant shift scheduling, staff scheduling software, employee scheduling restaurant, shift management restaurant, attendance tracking restaurant',
  openGraph: { title: 'Restaurant Shift Scheduling | DineOpen', description: 'Drag-and-drop shift scheduling with attendance tracking and payroll integration.', url: 'https://www.dineopen.com/products/admin/shifts' },
  alternates: { canonical: 'https://www.dineopen.com/products/admin/shifts' },
};

export default function ShiftsPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Shift Scheduling", "applicationCategory": "BusinessApplication", "description": "Restaurant shift scheduling with templates, drag-and-drop assignment, attendance tracking, and payroll integration.", "url": "https://www.dineopen.com/products/admin/shifts", "offers": [{ "@type": "Offer", "price": "89", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How do I create shift schedules?", "acceptedAnswer": { "@type": "Answer", "text": "Create shift templates (morning 6AM-2PM, afternoon 2PM-10PM, night 10PM-6AM) and assign staff using drag-and-drop. Copy previous week schedules and modify as needed. Publish schedules for staff to view on their app." } },
      { "@type": "Question", "name": "Can staff request shift swaps?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Staff can request shift swaps with colleagues through the app. Managers review and approve/deny swap requests. Both parties are notified of the outcome." } },
      { "@type": "Question", "name": "How does attendance tracking work?", "acceptedAnswer": { "@type": "Answer", "text": "Staff check in and out via the app at the start and end of their shifts. Managers see real-time attendance status. Late arrivals and early departures are flagged. Overtime is calculated automatically." } },
      { "@type": "Question", "name": "Does it calculate payroll hours?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen tracks total hours worked, overtime hours, and attendance for each staff member. Export hourly reports for payroll processing. Set different hourly rates for regular and overtime hours." } },
      { "@type": "Question", "name": "Can I schedule across multiple locations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Schedule staff at different locations on different days. View cross-location schedules to avoid conflicts. Track hours per location for accurate payroll allocation." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Admin", "item": "https://www.dineopen.com/products/admin" },
      { "@type": "ListItem", "position": 3, "name": "Shifts", "item": "https://www.dineopen.com/products/admin/shifts" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <ShiftsClient />
    </>
  );
}
