'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaToggleOn, FaBarcode, FaImages, FaStar, FaThLarge, FaList, FaSearch, FaLeaf, FaSmile, FaTag, FaCheck, FaArrowRight, FaChevronDown, FaChevronUp, FaDollarSign, FaEye } from 'react-icons/fa';

export default function ManagementClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const crudFeatures = [
    { icon: <FaPlus size={20} />, title: 'Add Items', desc: 'Add new menu items with name, price, description, category, and images. Set veg/non-veg status, assign short codes, and configure availability. Each item can have multiple images displayed in a carousel.', color: '#10b981' },
    { icon: <FaEdit size={20} />, title: 'Edit Items', desc: 'Update any item detail instantly. Change prices, descriptions, images, or categories. All edits reflect immediately on your live digital menu. No need to republish or regenerate QR codes.', color: '#3b82f6' },
    { icon: <FaTrash size={20} />, title: 'Delete Items', desc: 'Remove items you no longer serve. Deleted items are removed from your live menu instantly. For seasonal items, consider using the availability toggle instead of deleting.', color: '#ef4444' },
    { icon: <FaEye size={20} />, title: 'Preview Items', desc: 'See exactly how each item appears on your live menu before and after edits. Preview in grid view or list view. Check how images, descriptions, and prices display across devices.', color: '#8b5cf6' },
  ];

  const managementFeatures = [
    {
      icon: <FaSmile size={28} />,
      title: 'Categories with Emoji Support',
      desc: 'Organize your menu into categories like Starters, Main Course, Desserts, and Beverages. Each category can have an emoji for visual identification - use a pizza emoji for Italian dishes, a coffee cup for drinks, or a leaf for salads. Categories help customers navigate large menus quickly.',
      details: ['Unlimited categories', 'Emoji support for visual labels', 'Drag and drop reordering', 'Nested subcategories'],
      color: '#f59e0b',
    },
    {
      icon: <FaLeaf size={28} />,
      title: 'Veg/Non-Veg Indicators',
      desc: 'Every menu item can be marked as vegetarian or non-vegetarian with the standard indicator system. Green circle for veg, red circle for non-veg. This is essential for Indian restaurants and increasingly expected globally. Customers can filter the menu by dietary preference.',
      details: ['Green dot for vegetarian', 'Red dot for non-vegetarian', 'Filter menu by preference', 'Visible on all themes'],
      color: '#22c55e',
    },
    {
      icon: <FaUpload size={28} />,
      title: 'Bulk Menu Upload',
      desc: 'Got 50 or 500 items? Upload your entire menu from a spreadsheet in one go. Prepare a CSV or Excel file with columns for item name, price, category, and description. DineOpen processes the file and creates all items automatically. Saves hours of manual data entry.',
      details: ['CSV and Excel support', 'Map columns to fields', 'Preview before importing', 'Error reporting for invalid rows'],
      color: '#3b82f6',
    },
    {
      icon: <FaDollarSign size={28} />,
      title: 'Pricing Management',
      desc: 'Set and update prices for all items from one dashboard. Prices display in your local currency format. Update prices anytime and changes reflect instantly on your live menu. No need to reprint anything. Track price changes over time.',
      details: ['Multi-currency support', 'Instant price updates', 'Price displayed on all themes', 'Bulk price updates'],
      color: '#ef4444',
    },
    {
      icon: <FaToggleOn size={28} />,
      title: 'Availability Toggle',
      desc: 'Run out of an ingredient? Toggle any item as unavailable with a single click. The item appears grayed out or hidden on your customer-facing menu. When the item is back in stock, toggle it on again. No need to delete and re-add items.',
      details: ['One-click toggle', 'Instant update on live menu', 'Item preserved with all details', 'Toggle categories too'],
      color: '#8b5cf6',
    },
    {
      icon: <FaBarcode size={28} />,
      title: 'Short Codes for Quick Ordering',
      desc: 'Assign short alphanumeric codes to menu items for faster ordering. Your waitstaff can punch in "B1" for Butter Chicken instead of searching through the menu. Customers can also use short codes when ordering at the counter. Speeds up the entire ordering workflow.',
      details: ['Custom alphanumeric codes', 'Quick POS lookup', 'Print on receipts', 'Counter ordering support'],
      color: '#ec4899',
    },
    {
      icon: <FaImages size={28} />,
      title: 'Image Management with Carousel',
      desc: 'Upload multiple high-quality images per menu item. Images are displayed in a carousel that customers can swipe through. Great food photography increases orders by up to 30%. Manage all images from a central dashboard with drag-and-drop reordering.',
      details: ['Multiple images per item', 'Carousel display', 'Drag-and-drop reordering', 'Image optimization'],
      color: '#14b8a6',
    },
    {
      icon: <FaStar size={28} />,
      title: 'Favorite Items Marking',
      desc: 'Mark your best-selling or recommended items as favorites. Favorite items get special visual treatment on the menu - a star badge or highlight that draws customer attention. Use this to promote high-margin dishes or chef specials.',
      details: ['Star badge on favorites', 'Promote best-sellers', 'Visible on all themes', 'Easy toggle on/off'],
      color: '#f59e0b',
    },
  ];

  const viewModes = [
    { icon: <FaThLarge size={24} />, title: 'Grid View', desc: 'Display items in a visual grid with images, prices, and quick actions. Perfect for visual browsing and when food photography is a priority. Customers see multiple items at a glance.' },
    { icon: <FaList size={24} />, title: 'List View', desc: 'Display items in a compact list format with names, prices, and descriptions. Ideal for text-heavy menus and quick scanning. More items visible per screen.' },
    { icon: <FaSearch size={24} />, title: 'Search & Filter', desc: 'Built-in search bar lets you find any item instantly. Filter by category, veg/non-veg, availability, or favorites. Essential for managing large menus with hundreds of items.' },
  ];

  const faqs = [
    { q: 'How do I add a new menu item?', a: 'From your DineOpen dashboard, go to Menu, click Add Item, and fill in the name, price, category, and description. Upload one or more images, set the veg/non-veg status, and optionally assign a short code. Click Save and the item appears on your live menu instantly.' },
    { q: 'Can I organize my menu into categories?', a: 'Yes. Create unlimited categories like Starters, Main Course, Desserts, Beverages, etc. Each category can have an emoji for visual identification. You can reorder categories by dragging and dropping. Categories appear as tabs or sections on your customer-facing menu.' },
    { q: 'How does bulk upload work?', a: 'Prepare a CSV or Excel file with columns for item name, price, category, and description. Go to Menu, click Bulk Upload, and select your file. DineOpen maps the columns and shows a preview before importing. Any rows with errors are flagged so you can fix them.' },
    { q: 'What are short codes and how do I use them?', a: 'Short codes are quick identifiers you assign to items, like B1 for Butter Chicken or D5 for Dal Makhani. At the POS, your staff can type the short code instead of searching through the menu. It speeds up billing and reduces errors during rush hours.' },
    { q: 'How do I mark an item as unavailable?', a: 'Find the item in your menu dashboard and click the availability toggle. The item will appear grayed out or hidden on your customer menu. When the item is back in stock, toggle it on. The item retains all its details - you never need to re-enter information.' },
    { q: 'Can I add multiple images to a menu item?', a: 'Yes. Each item supports multiple images displayed in a swipeable carousel. Upload your best food photos - close-ups, plating shots, or ingredient highlights. Customers can swipe through all images. Good photography increases orders by up to 30%.' },
    { q: 'How do veg/non-veg indicators work?', a: 'When adding or editing an item, select Veg or Non-Veg. A green circle appears for vegetarian items and a red circle for non-vegetarian items on the customer menu. Customers can also filter the entire menu to show only veg or only non-veg items.' },
    { q: 'Can I switch between grid and list views?', a: 'Yes. The menu management dashboard supports both grid view (visual cards with images) and list view (compact text layout). Switch between them with a single click. The view mode you choose for your management dashboard is independent of how customers see the menu.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaEdit /> Menu Management
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Manage Your Entire Menu<br />From One Dashboard
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.95, marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
              Add, edit, organize, and control every aspect of your restaurant menu. Categories with emojis, bulk upload, veg/non-veg indicators, short codes, and instant availability toggles.
            </p>
            <Link href="/login?ref=menu" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start Managing Your Menu <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* CRUD Operations */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Complete Menu Item Control
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Full CRUD operations - create, read, update, and delete menu items with ease
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
              {crudFeatures.map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: `${item.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Management Features */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Powerful Menu Management Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Everything you need to keep your menu organized, accurate, and up-to-date
            </p>

            <div style={{ display: 'grid', gap: '24px' }}>
              {managementFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: isMobile ? '24px' : '32px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '56px', height: '56px', backgroundColor: `${feature.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, flexShrink: 0 }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                      <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px', marginLeft: isMobile ? '0' : '72px' }}>
                    {feature.details.map((detail, dIdx) => (
                      <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <FaCheck style={{ color: '#10b981', flexShrink: 0, fontSize: '11px' }} /> {detail}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* View Modes */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Multiple View Modes
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {viewModes.map((mode, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '32px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#ef4444', marginBottom: '16px' }}>{mode.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{mode.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{mode.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Menu Management FAQs
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0, marginLeft: '16px' }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0, marginLeft: '16px' }} />}
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Explore More Menu Features</h3>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products/menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>DineOpen Menu Overview</Link>
              <Link href="/products/menu/qr-menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>QR Menu Guide</Link>
              <Link href="/products/menu/digital-menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Digital Menu Builder</Link>
              <Link href="/products/menu/themes" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Menu Themes</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Take Control of Your Menu Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Add items, organize categories, set prices. Free trial, no credit card required.
            </p>
            <Link
              href="/login?ref=menu"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
