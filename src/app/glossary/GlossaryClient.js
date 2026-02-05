'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaSearch, FaBook } from 'react-icons/fa';

export default function GlossaryClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'POS & Technology', 'Kitchen', 'Service', 'Finance', 'Management', 'Food & Beverage'];

  const terms = [
    // POS & Technology
    { term: 'POS', full: 'Point of Sale', definition: 'The system used to process customer transactions, manage orders, and track sales in a restaurant.', category: 'POS & Technology' },
    { term: 'KOT', full: 'Kitchen Order Ticket', definition: 'A printed or digital ticket sent to the kitchen with order details including items, modifiers, and table number.', category: 'POS & Technology' },
    { term: 'KDS', full: 'Kitchen Display System', definition: 'Digital screens in the kitchen that show orders in real-time, replacing paper KOTs for better efficiency.', category: 'POS & Technology' },
    { term: 'QR Ordering', full: 'QR Code Ordering', definition: 'Contactless ordering system where customers scan a QR code to view the menu and place orders from their phones.', category: 'POS & Technology' },
    { term: 'Cloud POS', full: 'Cloud-Based Point of Sale', definition: 'POS system that stores data on remote servers, accessible from anywhere with internet connection.', category: 'POS & Technology' },
    { term: 'API', full: 'Application Programming Interface', definition: 'Technology that allows different software systems (like POS and delivery apps) to communicate and share data.', category: 'POS & Technology' },
    { term: 'EMV', full: 'Europay, Mastercard, Visa', definition: 'Chip-based card payment standard that provides better security than magnetic stripe cards.', category: 'POS & Technology' },
    { term: 'NFC', full: 'Near Field Communication', definition: 'Technology enabling contactless payments via tap-to-pay cards or mobile wallets like Google Pay and Apple Pay.', category: 'POS & Technology' },

    // Kitchen Terms
    { term: 'BOH', full: 'Back of House', definition: 'Areas of the restaurant not visible to guests, including kitchen, storage, and staff areas.', category: 'Kitchen' },
    { term: 'Mise en Place', full: null, definition: 'French term meaning "everything in its place." Refers to preparing and organizing ingredients before cooking begins.', category: 'Kitchen' },
    { term: 'Expo', full: 'Expeditor', definition: 'Person who coordinates orders between kitchen and servers, ensuring dishes are complete and properly presented.', category: 'Kitchen' },
    { term: 'Fire', full: null, definition: 'Kitchen command to begin cooking a dish. "Fire table 5" means start preparing that table\'s order.', category: 'Kitchen' },
    { term: '86', full: 'Eighty-Six', definition: 'Industry term meaning an item is out of stock or no longer available. "86 the salmon" means salmon is unavailable.', category: 'Kitchen' },
    { term: 'All Day', full: null, definition: 'Total count of a particular item needed. "3 steaks all day" means 3 total steaks are needed across all current orders.', category: 'Kitchen' },
    { term: 'On the Fly', full: null, definition: 'Urgent request to prepare something immediately, often to fix an error or accommodate a rush request.', category: 'Kitchen' },
    { term: 'Pickup', full: null, definition: 'Notification that a dish is ready to be taken to the table.', category: 'Kitchen' },
    { term: 'Ticket Time', full: null, definition: 'Time elapsed from when an order is placed until it\'s served to the guest.', category: 'Kitchen' },
    { term: 'FIFO', full: 'First In, First Out', definition: 'Inventory management method where oldest stock is used first to minimize waste and ensure freshness.', category: 'Kitchen' },

    // Service Terms
    { term: 'FOH', full: 'Front of House', definition: 'Guest-facing areas including dining room, bar, host stand, and any area customers can access.', category: 'Service' },
    { term: 'Covers', full: null, definition: 'Number of guests served. "We did 200 covers tonight" means 200 guests were served.', category: 'Service' },
    { term: 'Turn', full: 'Table Turn', definition: 'One complete cycle of a table being seated, served, and cleared. Higher turns mean more revenue.', category: 'Service' },
    { term: 'Walk-in', full: null, definition: 'Guest who arrives without a reservation.', category: 'Service' },
    { term: 'Wait List', full: null, definition: 'List of guests waiting for an available table when the restaurant is at capacity.', category: 'Service' },
    { term: 'Two-Top', full: null, definition: 'A table that seats two guests. Similarly, four-top (4), six-top (6), etc.', category: 'Service' },
    { term: 'Campers', full: null, definition: 'Guests who linger at their table long after finishing their meal, reducing table turns.', category: 'Service' },
    { term: 'VIP', full: 'Very Important Person', definition: 'High-priority guest who may receive special attention, complimentary items, or priority seating.', category: 'Service' },
    { term: 'Comp', full: 'Complimentary', definition: 'Item given to a guest for free, often to apologize for an issue or as a VIP gesture.', category: 'Service' },
    { term: 'Void', full: null, definition: 'Canceling an item from an order before it\'s prepared, removing it from the bill.', category: 'Service' },
    { term: 'Split Check', full: null, definition: 'Dividing a single table\'s bill into multiple payments, by person or custom amounts.', category: 'Service' },

    // Finance Terms
    { term: 'Food Cost', full: null, definition: 'Total cost of ingredients used to prepare menu items, typically expressed as a percentage of sales.', category: 'Finance' },
    { term: 'Labor Cost', full: null, definition: 'Total employee compensation including wages, benefits, and payroll taxes, typically 25-35% of revenue.', category: 'Finance' },
    { term: 'Prime Cost', full: null, definition: 'Combined food cost and labor cost - the two largest expenses for most restaurants.', category: 'Finance' },
    { term: 'RevPASH', full: 'Revenue Per Available Seat Hour', definition: 'Metric measuring revenue generated per seat during operating hours, used to optimize capacity.', category: 'Finance' },
    { term: 'ATV', full: 'Average Transaction Value', definition: 'Average amount spent per order or per guest, calculated by dividing total revenue by number of transactions.', category: 'Finance' },
    { term: 'Gross Margin', full: null, definition: 'Revenue minus cost of goods sold (food cost), expressed as a percentage.', category: 'Finance' },
    { term: 'Break-Even Point', full: null, definition: 'Sales volume at which total revenue equals total costs, after which the restaurant becomes profitable.', category: 'Finance' },
    { term: 'COGs', full: 'Cost of Goods Sold', definition: 'Direct costs of producing food and beverages sold, including ingredients but not labor or overhead.', category: 'Finance' },
    { term: 'P&L', full: 'Profit and Loss Statement', definition: 'Financial statement showing revenues, costs, and expenses over a specific period.', category: 'Finance' },
    { term: 'Par Level', full: null, definition: 'Minimum amount of inventory that should be maintained, triggering reorder when reached.', category: 'Finance' },

    // Management Terms
    { term: 'F&B', full: 'Food and Beverage', definition: 'Department or category encompassing all food and drink operations in a hospitality business.', category: 'Management' },
    { term: 'GM', full: 'General Manager', definition: 'Senior manager responsible for overall restaurant operations, staff, and financial performance.', category: 'Management' },
    { term: 'FSSAI', full: 'Food Safety and Standards Authority of India', definition: 'Regulatory body governing food safety in India. FSSAI license is mandatory for food businesses.', category: 'Management' },
    { term: 'HACCP', full: 'Hazard Analysis Critical Control Points', definition: 'Food safety management system identifying and controlling biological, chemical, and physical hazards.', category: 'Management' },
    { term: 'SOP', full: 'Standard Operating Procedure', definition: 'Documented procedures for consistent execution of tasks like food prep, cleaning, or service.', category: 'Management' },
    { term: 'Shift Lead', full: null, definition: 'Employee responsible for overseeing operations during a specific shift when managers aren\'t present.', category: 'Management' },
    { term: 'Cross-Training', full: null, definition: 'Training employees to perform multiple roles, increasing flexibility in scheduling.', category: 'Management' },
    { term: 'Pre-Shift', full: null, definition: 'Brief team meeting before service begins to discuss specials, 86 items, and VIP reservations.', category: 'Management' },

    // Food & Beverage
    { term: 'a la Carte', full: null, definition: 'Menu where each dish is priced and ordered separately, as opposed to prix fixe or thali.', category: 'Food & Beverage' },
    { term: 'Prix Fixe', full: null, definition: 'Set menu with predetermined courses at a fixed price, common in fine dining.', category: 'Food & Beverage' },
    { term: 'Thali', full: null, definition: 'Indian meal format serving multiple dishes in small portions on a single platter, often unlimited.', category: 'Food & Beverage' },
    { term: 'Modifier', full: null, definition: 'Special instruction or customization for a menu item, like "no onions" or "extra spicy."', category: 'Food & Beverage' },
    { term: 'Upsell', full: null, definition: 'Suggesting higher-priced items or add-ons to increase order value.', category: 'Food & Beverage' },
    { term: 'Add-on', full: null, definition: 'Extra item added to a base dish, like extra cheese, toppings, or sides.', category: 'Food & Beverage' },
    { term: 'Combo', full: 'Combination Meal', definition: 'Bundled menu items sold at a reduced price compared to ordering individually.', category: 'Food & Beverage' },
    { term: 'Happy Hour', full: null, definition: 'Promotional period offering discounted drinks and appetizers, typically during slow hours.', category: 'Food & Beverage' },
    { term: 'LTO', full: 'Limited Time Offer', definition: 'Temporary menu item or promotion available for a short period to drive interest.', category: 'Food & Beverage' },
  ];

  const filteredTerms = terms.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.full && item.full.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaBook /> 50+ Terms
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
              Restaurant Industry Glossary
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Essential terminology every restaurant owner and staff member should know. From POS to BOH, we&apos;ve got you covered.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
              <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ backgroundColor: 'white', padding: '24px 20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '80px', zIndex: 10 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: activeCategory === category ? '#1e40af' : '#f3f4f6',
                  color: activeCategory === category ? 'white' : '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Terms */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {Object.keys(groupedTerms).sort().map(letter => (
              <div key={letter} style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <span style={{ width: '48px', height: '48px', backgroundColor: '#1e40af', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
                    {letter}
                  </span>
                  <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb' }} />
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {groupedTerms[letter].map((item, idx) => (
                    <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{item.term}</h3>
                        {item.full && (
                          <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>({item.full})</span>
                        )}
                        <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7 }}>{item.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedTerms).length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>No terms found matching &quot;{searchTerm}&quot;</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Ready to Put Your Knowledge to Work?
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Try DineOpen&apos;s modern POS system built with all these concepts in mind.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: '#1e40af', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
