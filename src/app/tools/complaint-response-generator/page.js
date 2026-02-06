import ComplaintResponseClient from './ComplaintResponseClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Customer Complaint Response Generator | Restaurant | DineOpen',
  description: 'Generate professional responses to customer complaints. AI-powered templates for handling negative feedback, food complaints, and service issues.',
  keywords: 'customer complaint response, restaurant complaint reply, negative feedback response, customer service template, handling complaints restaurant',
  openGraph: {
    title: 'Customer Complaint Response Generator | DineOpen',
    description: 'Generate professional responses to customer complaints with AI.',
    url: 'https://www.dineopen.com/tools/complaint-response-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/complaint-response-generator' },
};

export default function ComplaintResponseGeneratorPage() {
  return <ComplaintResponseClient />;
}
