import TableTurnoverClient from './TableTurnoverClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Table Turnover Calculator | Restaurant Revenue Optimizer | DineOpen',
  description: 'Calculate restaurant revenue potential based on table turnover rate. Optimize seating efficiency and maximize daily covers.',
  keywords: 'table turnover calculator, restaurant table turnover rate, seat turnover, restaurant revenue calculator, covers per table',
  openGraph: {
    title: 'Table Turnover Calculator | DineOpen',
    description: 'Calculate revenue potential based on table turnover and seating efficiency.',
    url: 'https://www.dineopen.com/tools/table-turnover-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/table-turnover-calculator' },
};

export default function TableTurnoverCalculatorPage() {
  return <TableTurnoverClient />;
}
