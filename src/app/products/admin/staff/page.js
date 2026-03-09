import StaffClient from './StaffClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Staff Management Software | Roles & Permissions | DineOpen',
  description: 'Manage restaurant staff with role-based access control, credentials management, activity logging, and custom permission sets. Built-in roles for Employee, Manager, and Admin.',
  keywords: 'restaurant staff management, staff roles restaurant, employee management restaurant, role based access control restaurant, staff credentials management',
  openGraph: { title: 'Restaurant Staff Management | DineOpen', description: 'Role-based access, credentials management, and activity logging for restaurant staff.', url: 'https://www.dineopen.com/products/admin/staff' },
  alternates: { canonical: 'https://www.dineopen.com/products/admin/staff' },
};

export default function StaffPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Staff Management", "applicationCategory": "BusinessApplication", "description": "Restaurant staff management with role-based access control, credentials management, and activity tracking.", "url": "https://www.dineopen.com/products/admin/staff", "offers": [{ "@type": "Offer", "price": "9.99", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "What staff roles can I create?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen includes built-in roles: Employee (basic access), Manager (operational control), and Admin (full access). Create unlimited custom roles with granular permissions for each feature module." } },
      { "@type": "Question", "name": "How do staff credentials work?", "acceptedAnswer": { "@type": "Answer", "text": "Each staff member gets a unique username and password. Admins can generate credentials, force password resets, and revoke access instantly. Staff log in via the app to access their permitted features." } },
      { "@type": "Question", "name": "Can I track staff activity?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Activity logs record every action: orders taken, bills generated, voids processed, discounts applied, cash drawer openings, and more. Filter by staff member, date, or action type." } },
      { "@type": "Question", "name": "How many staff can I add?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen allows unlimited staff members on all plans. There are no per-user fees. Add as many employees, managers, and admins as you need." } },
      { "@type": "Question", "name": "Can staff access the system on their own phones?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Staff can log in from any device - their own phone, a shared tablet, or a desktop computer. Role permissions ensure they only see and access what they are allowed to." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Admin", "item": "https://www.dineopen.com/products/admin" },
      { "@type": "ListItem", "position": 3, "name": "Staff", "item": "https://www.dineopen.com/products/admin/staff" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <StaffClient />
    </>
  );
}
