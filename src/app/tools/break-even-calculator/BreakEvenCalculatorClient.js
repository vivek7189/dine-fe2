'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

const currencies = [
  { symbol: '$', label: '$ USD' },
  { symbol: '£', label: '£ GBP' },
  { symbol: '₹', label: '₹ INR' },
  { symbol: '€', label: '€ EUR' },
  { symbol: 'AED ', label: 'AED' },
  { symbol: 'C$', label: 'C$ CAD' },
  { symbol: 'A$', label: 'A$ AUD' },
  { symbol: 'S$', label: 'S$ SGD' },
];

const benchmarks = [
  { type: 'Food Truck', fixed: '$3,000 - $6,000', orders: '200 - 400', color: '#f0fdf4', border: '#bbf7d0' },
  { type: 'Small Cafe', fixed: '$8,000 - $15,000', orders: '400 - 800', color: '#eff6ff', border: '#bfdbfe' },
  { type: 'Casual Dining', fixed: '$15,000 - $30,000', orders: '800 - 1,500', color: '#fef3c7', border: '#fde68a' },
  { type: 'Full Service', fixed: '$25,000 - $50,000', orders: '1,200 - 2,500', color: '#fce7f3', border: '#f9a8d4' },
];

const faqData = [
  {
    q: 'What is the break-even point for a restaurant?',
    a: 'The break-even point is when your total revenue equals your total costs (fixed + variable). At this point, you are neither making a profit nor incurring a loss. For restaurants, it is typically measured as the number of orders or customers needed per month to cover all expenses including rent, salaries, utilities, food costs, and other overhead.',
  },
  {
    q: 'How long does it take a restaurant to break even?',
    a: 'Most restaurants take 3 to 5 years to fully break even on their initial investment. However, monthly operational break-even (covering monthly costs from monthly revenue) can happen within 6 to 18 months for well-managed restaurants. Fast-casual and food truck concepts often break even faster due to lower overhead.',
  },
  {
    q: 'What are typical fixed costs for a restaurant?',
    a: 'Fixed costs vary widely by format and location. A small cafe might have $8,000 to $15,000 per month in fixed costs, while a full-service restaurant could be $25,000 to $50,000 or more. Common fixed costs include rent or mortgage, salaried staff wages, insurance, loan payments, licenses, and software subscriptions.',
  },
  {
    q: 'How does average order value affect break-even?',
    a: 'Average order value directly impacts how many orders you need to break even. A higher average order means each customer contributes more toward covering your fixed costs. Strategies like upselling, combo meals, dessert menus, and premium add-ons can increase your average order value and significantly reduce the number of orders needed to break even.',
  },
  {
    q: 'How can technology help reach break-even faster?',
    a: 'POS systems, online ordering, and restaurant management software help you reach break-even faster by reducing labor costs, minimizing order errors, tracking food waste, optimizing inventory, and increasing average order values through smart upselling. Analytics dashboards also help you identify your most and least profitable items so you can optimize your menu.',
  },
];

const relatedTools = [
  { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Calculate food cost percentage and set profitable menu prices.' },
  { name: 'Menu Pricing Calculator', href: '/tools/menu-pricing-calculator', desc: 'Price menu items for profit with ideal food cost targets.' },
  { name: 'Restaurant Profit Margin', href: '/tools/restaurant-profit-margin-calculator', desc: 'Analyze profit margins across your restaurant operations.' },
  { name: 'Startup Cost Calculator', href: '/tools/startup-cost-calculator', desc: 'Estimate total investment needed to open your restaurant.' },
];

export default function BreakEvenCalculatorClient() {
  const [currency, setCurrency] = useState('$');
  const [fixedCosts, setFixedCosts] = useState('');
  const [avgOrderValue, setAvgOrderValue] = useState('');
  const [variableCostPercent, setVariableCostPercent] = useState(35);
  const [openFaq, setOpenFaq] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fixed = parseFloat(fixedCosts) || 0;
  const avgOrder = parseFloat(avgOrderValue) || 0;
  const variablePercent = variableCostPercent / 100;

  const contributionMargin = avgOrder * (1 - variablePercent);
  const breakEvenOrders = contributionMargin > 0 ? Math.ceil(fixed / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenOrders * avgOrder;
  const ordersPerDay = breakEvenOrders / 30;
  const ordersPerWeek = breakEvenOrders / 4.33;
  const revenuePerWeek = breakEvenRevenue / 4.33;

  // "What if?" scenario: 20% higher AOV
  const boostedOrder = avgOrder * 1.2;
  const boostedContribution = boostedOrder * (1 - variablePercent);
  const boostedBreakEven = boostedContribution > 0 ? Math.ceil(fixed / boostedContribution) : 0;
  const ordersSaved = breakEvenOrders - boostedBreakEven;

  // Progress bar: how far example revenue is from break-even
  const exampleDailyOrders = 20;
  const exampleMonthlyRevenue = exampleDailyOrders * 30 * avgOrder;
  const progressPercent = breakEvenRevenue > 0 ? Math.min((exampleMonthlyRevenue / breakEvenRevenue) * 100, 100) : 0;

  const hasResults = fixed > 0 && avgOrder > 0;

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const hintStyle = {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  };

  return (
    <>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Break-Even Calculator' }]} />

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', padding: isMobile ? '50px 20px 40px' : '70px 20px 50px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Free Calculator &bull; No Login
            </div>
            <h1 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
              Restaurant Break-Even Calculator
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', opacity: 0.95, maxWidth: '620px', margin: '0 auto', lineHeight: '1.6' }}>
              Find out exactly how many orders you need each month to cover costs and start making profit.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section style={{ padding: isMobile ? '30px 16px' : '50px 20px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '40px' }}>

              {/* Input Card */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Business Numbers</h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {currencies.map((c) => (
                      <option key={c.symbol} value={c.symbol}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Monthly Fixed Costs ({currency})</label>
                  <input
                    type="number"
                    value={fixedCosts}
                    onChange={(e) => setFixedCosts(e.target.value)}
                    placeholder="Rent, salaries, utilities, etc."
                    style={inputStyle}
                  />
                  <p style={hintStyle}>Include rent, salaries, insurance, loan payments</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Average Order Value ({currency})</label>
                  <input
                    type="number"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>Variable Costs: {variableCostPercent}% of sales</label>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={variableCostPercent}
                    onChange={(e) => setVariableCostPercent(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#4f46e5' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                    <span>20%</span>
                    <span>Food costs, packaging, payment fees</span>
                    <span>60%</span>
                  </div>
                </div>
              </div>

              {/* Results Card */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Break-Even Point</h2>

                {!hasResults ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#128200;</div>
                    <p style={{ fontSize: '15px' }}>Enter your fixed costs and average order value to see your break-even analysis.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px', padding: '20px', backgroundColor: '#eef2ff', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#3730a3', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders Needed Per Month</p>
                      <p style={{ fontSize: '44px', fontWeight: '800', color: '#4338ca', lineHeight: '1.1' }}>{breakEvenOrders.toLocaleString()}</p>
                      <p style={{ fontSize: '13px', color: '#4f46e5', marginTop: '6px' }}>
                        {ordersPerDay.toFixed(0)} orders/day &middot; {Math.round(ordersPerWeek)} orders/week
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Monthly Revenue</p>
                        <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{currency}{breakEvenRevenue.toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Weekly Revenue</p>
                        <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{currency}{Math.round(revenuePerWeek).toLocaleString()}</p>
                      </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '10px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px' }}>Contribution Margin Per Order</p>
                      <p style={{ fontSize: '22px', fontWeight: '700', color: '#059669' }}>{currency}{contributionMargin.toFixed(2)}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280' }}>Revenue kept after variable costs per order</p>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ padding: '16px', backgroundColor: '#fefce8', borderRadius: '10px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#854d0e', marginBottom: '8px', fontWeight: '600' }}>
                        Revenue vs Break-Even (at 20 orders/day)
                      </p>
                      <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          backgroundColor: progressPercent >= 100 ? '#22c55e' : '#f59e0b',
                          borderRadius: '6px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#92400e', marginTop: '6px' }}>
                        {currency}{Math.round(exampleMonthlyRevenue).toLocaleString()} of {currency}{breakEvenRevenue.toLocaleString()} ({progressPercent.toFixed(0)}%)
                      </p>
                    </div>

                    {/* What If */}
                    {ordersSaved > 0 && (
                      <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>What if you increased AOV by 20%?</p>
                        <p style={{ fontSize: '13px', color: '#15803d' }}>
                          At {currency}{boostedOrder.toFixed(2)} per order, you would need only <strong>{boostedBreakEven.toLocaleString()}</strong> orders
                          &mdash; <strong>{ordersSaved.toLocaleString()} fewer</strong> orders per month.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Industry Benchmarks */}
            <div style={{ ...cardStyle, marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Industry Benchmarks</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Typical monthly fixed costs and break-even orders by restaurant type (USD estimates).</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                {benchmarks.map((b, idx) => (
                  <div key={idx} style={{ padding: '20px', backgroundColor: b.color, borderRadius: '12px', border: `1px solid ${b.border}`, textAlign: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{b.type}</h3>
                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Fixed Costs/mo</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{b.fixed}</p>
                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>Orders to Break Even</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{b.orders}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div style={{ ...cardStyle, marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>How to Lower Your Break-Even Point</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { icon: '&#128181;', title: 'Reduce Fixed Costs', desc: 'Negotiate rent, optimize staffing schedules, switch to energy-efficient equipment, and reduce unnecessary subscriptions.' },
                  { icon: '&#128200;', title: 'Increase Average Order Value', desc: 'Train staff to upsell, create combo meals and family platters, add desserts and beverages, and offer premium add-ons.' },
                  { icon: '&#127869;', title: 'Lower Food Costs', desc: 'Negotiate better supplier deals, reduce food waste with inventory tracking, implement portion control, and optimize your menu mix.' },
                  { icon: '&#9889;', title: 'Improve Operational Efficiency', desc: 'Use POS technology for faster service, reduce order errors with digital ordering, and streamline kitchen workflows to serve more customers.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: item.icon }} />
                    <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '16px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Content Section */}
            <div style={{ ...cardStyle, marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Understanding Break-Even Analysis for Restaurants</h2>

              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                Break-even analysis is one of the most important financial exercises for any restaurant owner. Your break-even point is the moment when your total revenue equals your total expenses &mdash; meaning you are no longer losing money, but you have not yet started earning profit. Understanding this number helps you set realistic sales goals, price your menu correctly, and plan for sustainable growth.
              </p>

              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                The key concept behind break-even analysis is the <strong>contribution margin</strong>, which is the amount of money each order contributes toward covering your fixed costs after variable costs (like food, packaging, and payment processing) are subtracted. For example, if your average order is $25 and your variable costs are 35%, each order contributes $16.25 toward paying rent, salaries, and other fixed expenses.
              </p>

              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '16px' }}>
                There are two main levers for lowering your break-even point: reducing your fixed costs and increasing your contribution margin. Reducing fixed costs means negotiating better lease terms, optimizing labor schedules, or finding ways to cut overhead. Increasing your contribution margin can be achieved by raising prices, reducing food waste, negotiating better supplier rates, or upselling higher-margin items like beverages and desserts.
              </p>

              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '0' }}>
                Industry data shows that most restaurants take 3 to 5 years to break even on their initial investment, though monthly operational break-even is typically achieved within 6 to 18 months. Fast-casual concepts and food trucks often reach break-even faster due to lower overhead, while full-service restaurants with higher fixed costs may take longer. Regular break-even analysis &mdash; not just at launch, but ongoing &mdash; helps you stay ahead of rising costs and adapt your strategy.
              </p>
            </div>

            {/* FAQ Section */}
            <div style={{ ...cardStyle, marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Frequently Asked Questions</h2>
              {faqData.map((faq, idx) => (
                <div key={idx} style={{ borderBottom: idx < faqData.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#9ca3af', flexShrink: 0, transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ paddingBottom: '18px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Related Tools */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Free Tools</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                {relatedTools.map((tool, idx) => (
                  <Link key={idx} href={tool.href} style={{ textDecoration: 'none' }}>
                    <div style={{ ...cardStyle, textAlign: 'center', transition: 'box-shadow 0.2s ease', cursor: 'pointer' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px' }}>{tool.name}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{tool.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '32px 20px' : '48px 40px',
              backgroundColor: '#ef4444',
              borderRadius: '16px',
              color: 'white',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', marginBottom: '12px' }}>
                Stop Guessing. Start Tracking.
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                DineOpen gives you real-time sales analytics, cost tracking, and profit reports so you always know where you stand. Free to start.
              </p>
              <Link href="https://dineopen.com/login" style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: 'white',
                color: '#ef4444',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '16px',
              }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </div>

      <InternalLinks currentPath="/tools/break-even-calculator" variant="tool" />
      <Footer />
    </>
  );
}
