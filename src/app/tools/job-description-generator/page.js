import JobDescriptionClient from './JobDescriptionClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Job Description Generator | Chef, Waiter JDs | DineOpen',
  description: 'Generate professional job descriptions for restaurant roles. AI-powered JD templates for chefs, waiters, managers, bartenders, and more.',
  keywords: 'restaurant job description, chef job description template, waiter JD, restaurant hiring, kitchen staff job description',
  openGraph: {
    title: 'Restaurant Job Description Generator | DineOpen',
    description: 'Generate professional job descriptions for all restaurant roles with AI.',
    url: 'https://www.dineopen.com/tools/job-description-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/job-description-generator' },
};

export default function JobDescriptionGeneratorPage() {
  return <JobDescriptionClient />;
}
