'use client';

import Link from 'next/link';

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  display: 'inline-block',
  transition: 'all 0.2s',
  backgroundColor: 'white',
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '12px',
};

const industries = [
  { name: 'Restaurants', href: '/for/restaurants' },
  { name: 'Cafes', href: '/for/cafes' },
  { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  { name: 'Bars & Pubs', href: '/for/bars-pubs' },
  { name: 'Bakeries', href: '/for/bakeries' },
  { name: 'Hotels', href: '/for/hotels' },
  { name: 'Food Trucks', href: '/for/food-trucks' },
  { name: 'QSR', href: '/for/qsr' },
  { name: 'Fine Dining', href: '/for/fine-dining' },
  { name: 'Sweet Shops', href: '/for/sweet-shops' },
  { name: 'Dhabas', href: '/for/dhabas' },
  { name: 'Catering', href: '/for/catering' },
];

const cities = [
  { name: 'Mumbai', href: '/pos/mumbai' },
  { name: 'Delhi', href: '/pos/delhi' },
  { name: 'Bangalore', href: '/pos/bangalore' },
  { name: 'Pune', href: '/pos/pune' },
  { name: 'Hyderabad', href: '/pos/hyderabad' },
  { name: 'Chennai', href: '/pos/chennai' },
  { name: 'Kolkata', href: '/pos/kolkata' },
  { name: 'Ahmedabad', href: '/pos/ahmedabad' },
  { name: 'Jaipur', href: '/pos/jaipur' },
  { name: 'USA', href: '/pos/usa' },
  { name: 'UK', href: '/pos/uk' },
  { name: 'UAE', href: '/pos/uae' },
];

const alternatives = [
  { name: 'Petpooja Alternative', href: '/alternatives/petpooja' },
  { name: 'Toast Alternative', href: '/alternatives/toast' },
  { name: 'Square Alternative', href: '/alternatives/square' },
  { name: 'POSist Alternative', href: '/alternatives/posist' },
  { name: 'Zomato Base Alternative', href: '/alternatives/zomato-base' },
  { name: 'Clover Alternative', href: '/alternatives/clover' },
];

const products = [
  { name: 'Cloud POS', href: '/products/pos-software' },
  { name: 'AI Agent', href: '/products/ai-agent' },
  { name: 'Waiter App', href: '/products/waiter-app' },
  { name: 'Inventory', href: '/products/inventory-management' },
  { name: 'Loyalty & Rewards', href: '/products/loyalty-rewards' },
  { name: 'Billing Software', href: '/products/billing-software' },
];

const tools = [
  { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator' },
  { name: 'Break-Even Calculator', href: '/tools/break-even-calculator' },
  { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
  { name: 'ROI Calculator', href: '/tools/roi-calculator' },
  { name: 'Menu Engineering', href: '/tools/menu-engineering' },
  { name: 'Restaurant Name Generator', href: '/tools/restaurant-name-generator' },
];

function LinkSection({ title, links, exclude }) {
  const filtered = exclude ? links.filter(l => l.href !== exclude) : links;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {filtered.map((link) => (
          <Link key={link.href} href={link.href} style={linkStyle}>
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * InternalLinks - Reusable cross-linking component for SEO
 * @param {string} currentPath - Current page path to exclude from links
 * @param {string} variant - Which sections to show: 'city', 'industry', 'alternative', 'tool', 'all'
 */
export default function InternalLinks({ currentPath, variant = 'all' }) {
  const showIndustries = ['all', 'city', 'tool', 'alternative'].includes(variant);
  const showCities = ['all', 'industry', 'tool'].includes(variant);
  const showAlternatives = ['all', 'city', 'industry'].includes(variant);
  const showProducts = ['all', 'tool', 'alternative'].includes(variant);
  const showTools = ['all', 'city', 'industry', 'alternative'].includes(variant);

  return (
    <section style={{
      padding: '48px 20px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          Explore DineOpen
        </h2>

        {showProducts && (
          <LinkSection title="Products" links={products} exclude={currentPath} />
        )}
        {showIndustries && (
          <LinkSection title="POS by Industry" links={industries} exclude={currentPath} />
        )}
        {showCities && (
          <LinkSection title="POS by Location" links={cities} exclude={currentPath} />
        )}
        {showAlternatives && (
          <LinkSection title="Compare Alternatives" links={alternatives} exclude={currentPath} />
        )}
        {showTools && (
          <LinkSection title="Free Tools" links={tools} exclude={currentPath} />
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/pricing" style={{ ...linkStyle, backgroundColor: '#ef4444', color: 'white', border: '1px solid #ef4444', fontWeight: '700' }}>
            View Pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
