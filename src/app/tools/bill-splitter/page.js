import BillSplitterClient from './BillSplitterClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Bill Splitter Calculator | Split Restaurant Bill | DineOpen',
  description: 'Free bill splitter calculator. Split restaurant bills equally or by items. Add tip, tax, and see what each person owes. Perfect for group dining.',
  keywords: 'bill splitter calculator, split bill app, restaurant bill split, divide bill equally, group dining calculator, tip splitter',
  openGraph: {
    title: 'Bill Splitter Calculator | Split Restaurant Bill | DineOpen',
    description: 'Split restaurant bills easily. By people, by items, with tip and tax calculation.',
    url: 'https://www.dineopen.com/tools/bill-splitter',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/bill-splitter' },
};

export default function BillSplitterPage() {
  return <BillSplitterClient />;
}
