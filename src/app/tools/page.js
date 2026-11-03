import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';

export const dynamic = 'force-static';
export const revalidate = false;

const URL = 'https://www.dineopen.com/tools';

export const metadata = {
  title: 'Free Tools for Restaurant Owners: Bills, Costing, Staff',
  description: 'Free tools for restaurant, café and cloud kitchen owners. Make GST bills, quotations and salary slips, work out food cost and Swiggy/Zomato commission, plan staff and startup costs. No signup.',
  openGraph: {
    title: 'Free Tools for Restaurant Owners',
    description: 'Bill makers, costing calculators, staff and startup planners. Free, no signup.',
    url: URL,
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: URL },
};

const GROUPS = [
  {
    title: 'Bills & formats',
    note: 'Fill in, download the PDF or print.',
    tools: [
      ['restaurant-invoice-generator', 'Restaurant bill generator', 'GST bill with your logo, PDF or print'],
      ['catering-quotation-maker', 'Catering quotation maker', 'Per-plate quote with menu, extras and GST'],
      ['salary-slip-generator', 'Salary slip generator', 'Monthly pay slip with PF, ESI and advances'],
      ['daily-sales-report', 'Daily sales report format', 'Cash, UPI, card and app sales in Excel or WhatsApp'],
      ['kot-system', 'KOT format', 'Printable kitchen order ticket, 58mm / 80mm'],
      ['menu-card-maker', 'Menu card maker', 'Design a menu and download it'],
      ['qr-menu-maker', 'QR menu maker', 'A QR code that opens your menu'],
      ['logo-maker', 'Logo maker', 'A simple logo for your board and bills'],
    ],
  },
  {
    title: 'Starting a food business',
    note: 'Before you sign the rent agreement.',
    tools: [
      ['food-business-profit-calculator', 'Food business profit calculator', 'Monthly profit for a café, cloud kitchen, bakery or tiffin'],
      ['startup-cost-calculator', 'Startup cost calculator', 'What it costs to open'],
      ['restaurant-kitchen-equipment-list', 'Kitchen equipment list with price', 'Checklist by format, with India price ranges'],
      ['restaurant-pos-hardware', 'POS machine & hardware kit', 'Billing printer, tablet, cash drawer prices'],
      ['fssai-fee-calculator', 'FSSAI licence fee calculator', 'Basic, State or Central licence and its fee'],
      ['rent-calculator', 'Rent affordability calculator', 'How much rent your sales can carry'],
      ['break-even-calculator', 'Break-even calculator', 'Sales you need to stop losing money'],
      ['emi-calculator', 'Business loan EMI calculator', 'Monthly EMI for a setup loan'],
      ['seating-capacity-calculator', 'Seating capacity calculator', 'How many seats fit in your space'],
      ['restaurant-name-generator', 'Restaurant name generator', 'Name ideas for your place'],
      ['tagline-generator', 'Tagline generator', 'A short line for your board'],
      ['business-plan-generator', 'Business plan generator', 'A plan to show a bank or partner'],
      ['opening-checklist', 'Opening checklist', 'Licences, setup and launch tasks'],
      ['restaurant-quiz', 'Should I open a restaurant?', 'A quick readiness check'],
      ['delivery-radius-calculator', 'Delivery radius calculator', 'How far you can deliver and still profit'],
    ],
  },
  {
    title: 'Costing, pricing & profit',
    note: 'Know what each plate really earns.',
    tools: [
      ['food-cost-calculator', 'Food cost calculator', 'Food cost % and the right menu price'],
      ['recipe-cost-calculator', 'Recipe cost calculator', 'Cost of one dish from its ingredients'],
      ['menu-price-calculator', 'Menu price calculator', 'Price a dish for your target margin'],
      ['profit-margin-calculator', 'Profit margin calculator', 'Margin on any item'],
      ['swiggy-zomato-calculator', 'Swiggy & Zomato commission calculator', 'What you keep from an app order'],
      ['gst-calculator', 'GST calculator for restaurants', '5% / 18% GST, inclusive or extra'],
      ['catering-calculator', 'Catering price calculator', 'Price per person for an event'],
      ['menu-engineering', 'Menu engineering', 'Which dishes to push, fix or drop'],
      ['liquor-cost-calculator', 'Liquor pour cost calculator', 'Cost and price per peg or cocktail'],
      ['waste-calculator', 'Food waste calculator', 'What wastage costs you each month'],
      ['electricity-calculator', 'Electricity cost calculator', 'Monthly power bill for your kitchen'],
      ['inventory-par-calculator', 'Inventory par level calculator', 'How much stock to keep'],
      ['table-turnover-calculator', 'Table turnover calculator', 'Covers and sales per table'],
      ['revenue-forecast-calculator', 'Revenue forecast', 'Next months’ sales from today’s numbers'],
      ['customer-lifetime-value-calculator', 'Customer lifetime value', 'What a regular is worth'],
      ['restaurant-valuation-calculator', 'Restaurant valuation calculator', 'What your business could sell for'],
      ['roi-calculator', 'POS ROI calculator', 'What a billing system saves you'],
    ],
  },
  {
    title: 'Staff',
    note: 'Hiring, shifts and pay.',
    tools: [
      ['staff-calculator', 'Staff calculator', 'How many people you need'],
      ['labor-cost-calculator', 'Labour cost calculator', 'Staff cost as a share of sales'],
      ['shift-scheduler', 'Shift scheduler', 'Weekly rota you can print'],
      ['job-description-generator', 'Job description generator', 'Ads for cook, waiter, cashier'],
      ['tip-pooling-calculator', 'Tip pooling calculator', 'Split tips fairly by hours and role'],
      ['closing-checklist', 'Closing checklist', 'End-of-day tasks for the team'],
    ],
  },
  {
    title: 'Marketing & reviews',
    note: 'Bring people back.',
    tools: [
      ['google-review-calculator', 'Google rating calculator', 'How many 5-star reviews to reach your target'],
      ['review-response-generator', 'Review reply generator', 'Replies to good and bad reviews'],
      ['complaint-response-generator', 'Complaint reply generator', 'Calm replies to unhappy guests'],
      ['social-caption-generator', 'Instagram caption generator', 'Captions for food posts'],
      ['menu-description-generator', 'Menu description generator', 'Short dish descriptions that sell'],
      ['loyalty-program', 'Loyalty program', 'Points and rewards for regulars'],
    ],
  },
  {
    title: 'Kitchen',
    note: '',
    tools: [
      ['recipe-scaler', 'Recipe scaler', 'Scale a recipe up or down'],
      ['kitchen-conversion-calculator', 'Kitchen conversion calculator', 'Cups, grams, ml and spoons'],
      ['calorie-calculator', 'Menu calorie calculator', 'Calories and nutrition per dish'],
    ],
  },
  {
    title: 'Guests & other countries',
    note: '',
    tools: [
      ['tip-calculator', 'Tip calculator', 'Tip and split a bill'],
      ['bill-splitter', 'Bill splitter', 'Split a restaurant bill between friends'],
      ['vat-calculator', 'UK VAT calculator', 'Add or remove VAT'],
      ['gst-hst-calculator', 'Canada GST/HST calculator', 'Tax by province'],
      ['sales-tax-calculator', 'US sales tax calculator', 'Tax by state'],
    ],
  },
];

export default function ToolsHubPage() {
  const all = GROUPS.flatMap((g) => g.tools);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free tools for restaurant owners',
    url: URL,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: all.length,
      itemListElement: all.map(([slug, name], i) => ({ '@type': 'ListItem', position: i + 1, name, url: `${URL}/${slug}` })),
    },
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CommonHeader />
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 16px 64px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#111827', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Free tools for restaurant owners
        </h1>
        <p style={{ fontSize: '17px', color: '#4b5563', maxWidth: '680px', lineHeight: 1.6, margin: '0 0 36px' }}>
          Bill and quotation makers, costing calculators and planners for restaurants, cafés, cloud kitchens and food stalls.
          All free, nothing to sign up for.
        </p>

        {GROUPS.map((g) => (
          <section key={g.title} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{g.title}</h2>
            {g.note && <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 14px' }}>{g.note}</p>}
            <div className="tools-hub-grid">
              {g.tools.map(([slug, name, line]) => (
                <Link key={slug} href={`/tools/${slug}`} className="tools-hub-card">
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{name}</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{line}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div style={{ background: '#111827', color: 'white', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Tired of doing this by hand every day?</div>
            <div style={{ fontSize: '15px', color: '#d1d5db', lineHeight: 1.6 }}>
              DineOpen prints GST bills and KOTs, tracks stock and staff, and sends you the day&apos;s sales on WhatsApp.
            </div>
          </div>
          <Link href="/restaurant-pos-software-india" style={{ background: '#ef4444', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
            See the restaurant POS
          </Link>
        </div>
      </main>
      <Footer />
      <style>{`
        .tools-hub-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .tools-hub-card { display: block; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s, box-shadow .15s; }
        .tools-hub-card:hover { border-color: #fca5a5; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        @media (max-width: 900px) { .tools-hub-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .tools-hub-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
