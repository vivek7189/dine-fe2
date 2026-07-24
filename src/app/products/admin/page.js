import AdminLandingClient from './AdminLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Management System | Staff & Multi-Location | DineOpen Admin',
  description: 'Complete restaurant management system with multi-location support, staff management, role-based access, tax configuration, menu sync, shift scheduling, printer settings, and Google Reviews integration.',
  keywords: 'restaurant management system, multi restaurant management, staff management restaurant, restaurant admin software, role based access restaurant, shift scheduling restaurant',
  openGraph: {
    title: 'Restaurant Management System | DineOpen Admin',
    description: 'Multi-location management, staff roles, tax configuration, shift scheduling, and more.',
    url: 'https://www.dineopen.com/products/admin',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Management System | DineOpen Admin',
    description: 'Staff management, multi-location, tax configuration, and Google Reviews integration.',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/admin' },
};

export default function AdminPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Admin",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Management System",
    "description": "Complete restaurant management system with multi-location support, staff management with role-based access, tax configuration, menu synchronization, shift scheduling, printer settings, and Google Reviews integration.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/admin",
    "offers": [
      { "@type": "Offer", "price": "20", "priceCurrency": "USD", "description": "Starter plan" },
      { "@type": "Offer", "price": "299", "priceCurrency": "INR", "description": "Starter plan (India)" },
      { "@type": "Offer", "price": "99", "priceCurrency": "USD", "description": "Pro plan" },
      { "@type": "Offer", "price": "1799", "priceCurrency": "INR", "description": "Pro plan (India)" }
    ],
    "featureList": [
      "Multi-restaurant management",
      "Staff CRUD with role assignment",
      "Credentials management",
      "Menu synchronization",
      "Tax configuration",
      "Currency management (150+ countries)",
      "Printer settings",
      "Shift scheduling",
      "Google Reviews integration"
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "490" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can I manage multiple restaurants from one account?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen Admin supports unlimited restaurant locations under one account. Each location has independent menus, staff, inventory, and billing. Switch between locations instantly from the dashboard." } },
      { "@type": "Question", "name": "What staff roles are supported?", "acceptedAnswer": { "@type": "Answer", "text": "Built-in roles include Employee, Manager, and Admin. You can also create custom roles with granular permissions for each feature (billing, inventory, menu editing, reporting, etc.). Assign multiple roles to a single staff member." } },
      { "@type": "Question", "name": "Can I sync menus across locations?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Create a master menu and push it to selected locations. Each location can have local modifications (different prices, availability, or location-specific items) while keeping the core menu synchronized." } },
      { "@type": "Question", "name": "Does DineOpen support Google Reviews integration?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Connect your Google My Business listing to display recent reviews on your dashboard. Track review trends, average rating, and respond to reviews directly from DineOpen. Great for monitoring customer sentiment." } },
      { "@type": "Question", "name": "How does shift scheduling work?", "acceptedAnswer": { "@type": "Answer", "text": "Create shift templates (morning, afternoon, evening, night). Assign staff to shifts with drag-and-drop scheduling. Staff can view their schedules, request swaps, and check in/out via the app. Track hours for payroll." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Admin", "item": "https://www.dineopen.com/products/admin" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AdminLandingClient />
    </>
  );
}
