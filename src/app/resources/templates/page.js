import TemplatesHubClient from './TemplatesHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Templates | Menu, Invoice, Inventory | DineOpen',
  description: 'Free downloadable templates for restaurants. Menu templates, invoice formats, inventory sheets, staff schedules, and business plan templates. Excel and PDF.',
  keywords: 'restaurant templates free, menu template download, restaurant invoice format, inventory template excel, staff schedule template, restaurant business plan template',
  openGraph: {
    title: 'Free Restaurant Templates | DineOpen',
    description: 'Free downloadable templates for restaurants. Menu, invoice, inventory, and more.',
    url: 'https://www.dineopen.com/resources/templates',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/templates' },
};

export default function TemplatesHubPage() {
  return <TemplatesHubClient />;
}
