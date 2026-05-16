'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import {
  FaUtensils, FaPlus, FaTrash, FaDownload, FaPalette,
  FaChevronDown, FaChevronUp, FaArrowRight, FaCheckCircle,
  FaEdit, FaEye, FaTag, FaListUl, FaStar,
} from 'react-icons/fa';

// ─── Template Definitions ────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'elegant',
    name: 'Elegant',
    desc: 'Serif fonts, gold accents, dark luxury feel',
    previewBg: '#1a1a2e',
    previewAccent: '#c9a96e',
    previewText: '#f5f0e8',
    styles: {
      wrapper: {
        background: '#1a1a2e',
        color: '#f5f0e8',
        fontFamily: '"Georgia", "Times New Roman", serif',
        padding: '48px 40px',
        minHeight: '600px',
      },
      restaurantName: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#c9a96e',
        textAlign: 'center',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        marginBottom: '6px',
      },
      tagline: {
        fontSize: '13px',
        color: '#a89070',
        textAlign: 'center',
        fontStyle: 'italic',
        letterSpacing: '2px',
        marginBottom: '32px',
      },
      divider: {
        border: 'none',
        borderTop: '1px solid #c9a96e',
        margin: '24px auto',
        width: '60%',
        opacity: 0.5,
      },
      categoryName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#c9a96e',
        textAlign: 'center',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        marginTop: '28px',
      },
      itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '14px',
        borderBottom: '1px dotted rgba(201,169,110,0.2)',
        paddingBottom: '10px',
      },
      itemName: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#f5f0e8',
      },
      itemDesc: {
        fontSize: '12px',
        color: '#a89070',
        fontStyle: 'italic',
        marginTop: '2px',
      },
      itemPrice: {
        fontSize: '15px',
        color: '#c9a96e',
        fontWeight: '600',
        flexShrink: 0,
        marginLeft: '16px',
      },
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Clean sans-serif, black & white with green accents',
    previewBg: '#ffffff',
    previewAccent: '#16a34a',
    previewText: '#111827',
    styles: {
      wrapper: {
        background: '#ffffff',
        color: '#111827',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        padding: '48px 40px',
        minHeight: '600px',
        border: '1px solid #e5e7eb',
      },
      restaurantName: {
        fontSize: '30px',
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        letterSpacing: '-0.5px',
        marginBottom: '6px',
      },
      tagline: {
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center',
        letterSpacing: '0.5px',
        marginBottom: '32px',
      },
      divider: {
        border: 'none',
        borderTop: '2px solid #16a34a',
        margin: '24px auto',
        width: '40px',
      },
      categoryName: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#16a34a',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        marginTop: '28px',
        paddingBottom: '6px',
        borderBottom: '1px solid #e5e7eb',
      },
      itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '12px',
        paddingBottom: '10px',
      },
      itemName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
      },
      itemDesc: {
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '2px',
      },
      itemPrice: {
        fontSize: '14px',
        color: '#16a34a',
        fontWeight: '700',
        flexShrink: 0,
        marginLeft: '16px',
        backgroundColor: '#f0fdf4',
        padding: '2px 8px',
        borderRadius: '4px',
      },
    },
  },
  {
    id: 'rustic',
    name: 'Rustic',
    desc: 'Warm tones, paper-like background, homestyle feel',
    previewBg: '#faf0e6',
    previewAccent: '#8b4513',
    previewText: '#3d1f0a',
    styles: {
      wrapper: {
        background: '#faf0e6',
        color: '#3d1f0a',
        fontFamily: '"Georgia", serif',
        padding: '48px 40px',
        minHeight: '600px',
        border: '6px double #deb887',
        outline: '2px solid #c8a97a',
        outlineOffset: '-12px',
      },
      restaurantName: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#8b4513',
        textAlign: 'center',
        letterSpacing: '2px',
        marginBottom: '6px',
      },
      tagline: {
        fontSize: '13px',
        color: '#a0522d',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: '28px',
      },
      divider: {
        border: 'none',
        borderTop: '2px solid #deb887',
        margin: '20px auto',
        width: '70%',
      },
      categoryName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#8b4513',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '14px',
        marginTop: '24px',
        padding: '6px 0',
        borderTop: '1px solid #deb887',
        borderBottom: '1px solid #deb887',
      },
      itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '12px',
        paddingBottom: '8px',
      },
      itemName: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#3d1f0a',
      },
      itemDesc: {
        fontSize: '12px',
        color: '#a0522d',
        fontStyle: 'italic',
        marginTop: '2px',
      },
      itemPrice: {
        fontSize: '14px',
        color: '#8b4513',
        fontWeight: '700',
        flexShrink: 0,
        marginLeft: '16px',
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Ultra-clean, light gray lines, monospace prices',
    previewBg: '#f9fafb',
    previewAccent: '#374151',
    previewText: '#111827',
    styles: {
      wrapper: {
        background: '#f9fafb',
        color: '#111827',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        padding: '56px 48px',
        minHeight: '600px',
      },
      restaurantName: {
        fontSize: '20px',
        fontWeight: '300',
        color: '#111827',
        textAlign: 'center',
        letterSpacing: '8px',
        textTransform: 'uppercase',
        marginBottom: '6px',
      },
      tagline: {
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '40px',
      },
      divider: {
        border: 'none',
        borderTop: '1px solid #d1d5db',
        margin: '28px auto',
        width: '100%',
      },
      categoryName: {
        fontSize: '10px',
        fontWeight: '600',
        color: '#6b7280',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        marginTop: '32px',
      },
      itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '14px',
      },
      itemName: {
        fontSize: '14px',
        fontWeight: '400',
        color: '#1f2937',
      },
      itemDesc: {
        fontSize: '11px',
        color: '#9ca3af',
        marginTop: '2px',
      },
      itemPrice: {
        fontSize: '13px',
        color: '#374151',
        fontFamily: '"Courier New", monospace',
        fontWeight: '600',
        flexShrink: 0,
        marginLeft: '16px',
      },
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'Bright colors, large typography, eye-catching',
    previewBg: '#18181b',
    previewAccent: '#ef4444',
    previewText: '#ffffff',
    styles: {
      wrapper: {
        background: '#18181b',
        color: '#ffffff',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        padding: '48px 40px',
        minHeight: '600px',
      },
      restaurantName: {
        fontSize: '36px',
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '-1px',
        textTransform: 'uppercase',
        marginBottom: '6px',
        lineHeight: 1,
      },
      tagline: {
        fontSize: '13px',
        color: '#ef4444',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '28px',
      },
      divider: {
        border: 'none',
        borderTop: '4px solid #ef4444',
        margin: '20px auto',
        width: '80px',
      },
      categoryName: {
        fontSize: '12px',
        fontWeight: '800',
        color: '#ef4444',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        marginTop: '28px',
        padding: '8px 16px',
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderLeft: '4px solid #ef4444',
      },
      itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '12px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      },
      itemName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      itemDesc: {
        fontSize: '11px',
        color: '#71717a',
        marginTop: '2px',
        textTransform: 'none',
        fontWeight: '400',
        letterSpacing: '0',
      },
      itemPrice: {
        fontSize: '16px',
        color: '#ef4444',
        fontWeight: '900',
        flexShrink: 0,
        marginLeft: '16px',
      },
    },
  },
];

const CURRENCIES = [
  { symbol: '₹', label: '₹ INR' },
  { symbol: '$', label: '$ USD' },
  { symbol: '£', label: '£ GBP' },
  { symbol: 'AED', label: 'AED' },
  { symbol: 'QAR', label: 'QAR' },
];

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Starters',
    items: [
      { id: 'item-1', name: 'Crispy Spring Rolls', desc: 'Golden fried rolls with cabbage & glass noodles', price: '220' },
      { id: 'item-2', name: 'Soup of the Day', desc: 'Ask your server for today\'s selection', price: '180' },
      { id: 'item-3', name: 'Tandoori Mushroom', desc: 'Marinated button mushrooms, mint chutney', price: '290' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Main Course',
    items: [
      { id: 'item-4', name: 'Butter Chicken', desc: 'Classic creamy tomato gravy, served with naan', price: '380' },
      { id: 'item-5', name: 'Grilled Salmon', desc: 'Atlantic salmon, lemon butter, seasonal vegetables', price: '620' },
      { id: 'item-6', name: 'Paneer Tikka Masala', desc: 'Cottage cheese in spiced masala, basmati rice', price: '340' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Desserts',
    items: [
      { id: 'item-7', name: 'Gulab Jamun', desc: 'Served warm with vanilla ice cream', price: '150' },
      { id: 'item-8', name: 'Chocolate Lava Cake', desc: 'Dark chocolate, molten center, berry coulis', price: '280' },
      { id: 'item-9', name: 'Rasmalai', desc: 'Chilled cottage cheese dumplings in saffron cream', price: '170' },
    ],
  },
];

// ─── Menu Preview Component ───────────────────────────────────────────────────

function MenuPreview({ restaurantName, tagline, currency, categories, template }) {
  const T = template.styles;
  const displayCurrency = currency === 'AED' || currency === 'QAR' ? `${currency} ` : currency;

  return (
    <div style={T.wrapper}>
      <div style={T.restaurantName}>{restaurantName || 'Your Restaurant Name'}</div>
      {(tagline || !restaurantName) && (
        <div style={T.tagline}>{tagline || 'Fine Dining & Catering'}</div>
      )}
      <hr style={T.divider} />
      {categories.map((cat, catIdx) => (
        <div key={cat.id}>
          {catIdx > 0 && <div style={{ marginTop: '8px' }} />}
          <div style={T.categoryName}>{cat.name || 'Category Name'}</div>
          {cat.items.map(item => (
            <div key={item.id} style={T.itemRow}>
              <div style={{ flex: 1 }}>
                <div style={T.itemName}>{item.name || 'Item Name'}</div>
                {item.desc && <div style={T.itemDesc}>{item.desc}</div>}
              </div>
              <div style={T.itemPrice}>
                {item.price ? `${displayCurrency}${item.price}` : '—'}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Print-only Menu (hidden, used for PDF) ──────────────────────────────────

function PrintableMenu({ restaurantName, tagline, currency, categories, template }) {
  const T = template.styles;
  const displayCurrency = currency === 'AED' || currency === 'QAR' ? `${currency} ` : currency;

  return (
    <div
      id="printable-menu"
      style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        zIndex: -1,
      }}
    >
      <div style={{ ...T.wrapper, padding: '60px 60px', minHeight: 'auto' }}>
        <div style={T.restaurantName}>{restaurantName || 'Your Restaurant Name'}</div>
        {tagline && <div style={T.tagline}>{tagline}</div>}
        <hr style={T.divider} />
        {categories.map((cat, catIdx) => (
          <div key={cat.id}>
            {catIdx > 0 && <div style={{ marginTop: '8px' }} />}
            <div style={T.categoryName}>{cat.name}</div>
            {cat.items.map(item => (
              <div key={item.id} style={T.itemRow}>
                <div style={{ flex: 1 }}>
                  <div style={T.itemName}>{item.name}</div>
                  {item.desc && <div style={T.itemDesc}>{item.desc}</div>}
                </div>
                <div style={T.itemPrice}>
                  {item.price ? `${displayCurrency}${item.price}` : '—'}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What size should a restaurant menu be?',
    a: 'The most popular menu size is standard Letter (8.5" x 11") or A4 (210 x 297mm). Fine dining restaurants often prefer taller, narrow menus (4" x 14") for an elegant look. Cafes and casual restaurants commonly use a single half-letter page (5.5" x 8.5"). The right size depends on how many items you have — aim for a menu that doesn\'t feel cluttered. With 15–20 items, a single A4 page works perfectly.',
  },
  {
    q: 'How many items should be on a restaurant menu?',
    a: 'Research (the "paradox of choice") shows that fewer choices lead to happier customers. Most successful restaurants keep 6–10 items per category and a total of 20–35 items across all categories. Fine dining menus may have only 10–15 items total. QSR and casual dining can go up to 50 items, but anything above that starts hurting the guest experience and kitchen efficiency. When in doubt, cut your menu — focus on your best-selling, highest-margin items.',
  },
  {
    q: 'Should I show currency symbols on my menu?',
    a: 'Studies from Cornell University suggest that omitting currency symbols (showing "350" instead of "₹350") can increase spending by up to 8%, as it reduces the psychological "pain of paying". However, for takeaway menus, delivery platforms, or price-sensitive markets, currency symbols build trust and clarity. A good middle ground: include a small note like "All prices in INR" at the top and show only numbers alongside items.',
  },
  {
    q: 'What font is best for restaurant menus?',
    a: 'For fine dining and elegant concepts, serif fonts like Playfair Display or Georgia communicate luxury and tradition. For modern, casual restaurants, clean sans-serifs like Inter, Lato, or Montserrat are highly readable. For artisanal or rustic concepts, script fonts like Pacifico add character — but use scripts only for headings, never for item names or prices. The golden rule: body text must be at least 10–11pt and easily readable under dim lighting.',
  },
  {
    q: 'How often should I update my restaurant menu?',
    a: 'Review your menu seasonally (every 3 months) to incorporate seasonal ingredients, remove underperforming items, and adjust prices for ingredient cost changes. At minimum, do a thorough review twice a year. After any major ingredient price spike (>10%), immediately review your pricing. Fast-casual and QSR concepts can update specials weekly. Fine dining may change menus daily. Rule of thumb: if a dish has fewer than 5 orders per week, consider removing or reworking it.',
  },
];

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {FAQ_ITEMS.map((item, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', lineHeight: 1.4 }}>
              {item.q}
            </span>
            <span style={{ color: '#16a34a', flexShrink: 0 }}>
              {openIdx === idx ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          {openIdx === idx && (
            <div style={{ padding: '0 24px 20px', color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function MenuCardMakerClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantName, setRestaurantName] = useState('The Grand Spice');
  const [tagline, setTagline] = useState('Authentic Flavours, Modern Soul');
  const [currency, setCurrency] = useState('₹');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' on mobile
  const [printReady, setPrintReady] = useState(false);
  const printStyleRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Inject print styles once on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'menu-print-styles';
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #printable-menu { display: block !important; position: static !important; z-index: auto !important; }
        #printable-menu > div { page-break-inside: avoid; }
        @page { margin: 0; size: A4; }
      }
    `;
    document.head.appendChild(style);
    printStyleRef.current = style;
    return () => {
      if (printStyleRef.current) {
        document.head.removeChild(printStyleRef.current);
      }
    };
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  // ─── Category helpers ──────────────────────────────────────────────────────

  const addCategory = () => {
    setCategories(prev => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: 'New Category',
        items: [{ id: `item-${Date.now()}`, name: '', desc: '', price: '' }],
      },
    ]);
  };

  const removeCategory = (catId) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const updateCategoryName = (catId, name) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, name } : c));
  };

  const addItem = (catId) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        items: [...c.items, { id: `item-${Date.now()}`, name: '', desc: '', price: '' }],
      };
    }));
  };

  const removeItem = (catId, itemId) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      if (c.items.length <= 1) return c;
      return { ...c, items: c.items.filter(i => i.id !== itemId) };
    }));
  };

  const updateItem = (catId, itemId, field, value) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i),
      };
    }));
  };

  // ─── Input styles ─────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    marginBottom: '16px',
  };

  // ─── Editor Panel ─────────────────────────────────────────────────────────

  const EditorPanel = () => (
    <div>
      {/* Restaurant Info */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FaUtensils style={{ color: '#16a34a' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Restaurant Info</span>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Restaurant Name</label>
          <input
            style={inputStyle}
            value={restaurantName}
            onChange={e => setRestaurantName(e.target.value)}
            placeholder="e.g. The Grand Spice"
          />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Tagline / Subtitle <span style={{ color: '#9ca3af', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
          <input
            style={inputStyle}
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Authentic Flavours, Modern Soul"
          />
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => setCurrency(c.symbol)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: currency === c.symbol ? '2px solid #16a34a' : '1px solid #d1d5db',
                  backgroundColor: currency === c.symbol ? '#f0fdf4' : '#ffffff',
                  color: currency === c.symbol ? '#16a34a' : '#374151',
                  fontWeight: currency === c.symbol ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Picker */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FaPalette style={{ color: '#16a34a' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Menu Style</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: selectedTemplate.id === t.id ? '2px solid #16a34a' : '2px solid #e5e7eb',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Color preview */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: t.previewBg, border: '1px solid #e5e7eb' }} />
                <div style={{ width: '12px', height: '28px', borderRadius: '6px', backgroundColor: t.previewAccent }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.3 }}>{t.desc}</div>
              {selectedTemplate.id === t.id && (
                <div style={{ marginTop: '6px', color: '#16a34a', fontSize: '11px', fontWeight: '600' }}>
                  <FaCheckCircle style={{ marginRight: '3px' }} /> Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Categories & Items */}
      <div style={{ ...cardStyle, marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaListUl style={{ color: '#16a34a' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Menu Categories & Items</span>
          </div>
          <button
            onClick={addCategory}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', backgroundColor: '#16a34a', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
            }}
          >
            <FaPlus /> Add Category
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {categories.map((cat, catIdx) => (
            <div
              key={cat.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: '#16a34a', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', flexShrink: 0,
                }}>
                  {catIdx + 1}
                </div>
                <input
                  style={{ ...inputStyle, fontWeight: '700', fontSize: '15px', backgroundColor: 'transparent', border: 'none', padding: '0', flex: 1 }}
                  value={cat.name}
                  onChange={e => updateCategoryName(cat.id, e.target.value)}
                  placeholder="Category name"
                />
                {categories.length > 1 && (
                  <button
                    onClick={() => removeCategory(cat.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ef4444', padding: '4px', flexShrink: 0,
                    }}
                    title="Remove category"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {/* Items */}
              <div style={{ padding: '12px 16px' }}>
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '8px',
                      marginBottom: '10px',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <input
                        style={{ ...inputStyle, fontSize: '13px' }}
                        value={item.name}
                        onChange={e => updateItem(cat.id, item.id, 'name', e.target.value)}
                        placeholder={`Item ${itemIdx + 1} name`}
                      />
                      <input
                        style={{ ...inputStyle, fontSize: '12px', marginTop: '6px', color: '#6b7280' }}
                        value={item.desc}
                        onChange={e => updateItem(cat.id, item.id, 'desc', e.target.value)}
                        placeholder="Description (optional)"
                      />
                    </div>
                    <div>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                          color: '#6b7280', fontSize: '13px', pointerEvents: 'none',
                        }}>
                          {currency === 'AED' || currency === 'QAR' ? currency : currency}
                        </span>
                        <input
                          style={{ ...inputStyle, fontSize: '13px', paddingLeft: currency.length > 1 ? '44px' : '30px' }}
                          value={item.price}
                          onChange={e => updateItem(cat.id, item.id, 'price', e.target.value.replace(/[^\d.]/g, ''))}
                          placeholder="0"
                          inputMode="decimal"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(cat.id, item.id)}
                      disabled={cat.items.length <= 1}
                      style={{
                        background: 'none', border: 'none', cursor: cat.items.length <= 1 ? 'not-allowed' : 'pointer',
                        color: cat.items.length <= 1 ? '#d1d5db' : '#ef4444',
                        padding: '10px 6px', marginTop: '2px',
                      }}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addItem(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', backgroundColor: 'transparent',
                    border: '1px dashed #d1d5db', borderRadius: '8px',
                    color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                    marginTop: '4px', width: '100%', justifyContent: 'center',
                  }}
                >
                  <FaPlus /> Add Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden printable version */}
      <PrintableMenu
        restaurantName={restaurantName}
        tagline={tagline}
        currency={currency}
        categories={categories}
        template={selectedTemplate}
      />

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
        <CommonHeader />
        <div style={{ paddingTop: '80px' }}>

          {/* ── Hero ───────────────────────────────────────────────────── */}
          <section style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: 'white',
            padding: isMobile ? '48px 20px' : '72px 32px',
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                padding: '6px 18px',
                backgroundColor: 'rgba(22,163,74,0.2)',
                border: '1px solid rgba(22,163,74,0.4)',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#4ade80',
                fontWeight: '600',
                letterSpacing: '0.5px',
                marginBottom: '20px',
              }}>
                Free Tool — No Login Required
              </div>
              <h1 style={{
                fontSize: isMobile ? '30px' : '48px',
                fontWeight: '800',
                marginBottom: '16px',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
              }}>
                Restaurant Menu Card Maker
              </h1>
              <p style={{
                fontSize: isMobile ? '16px' : '20px',
                color: '#d1d5db',
                marginBottom: '28px',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto 28px',
              }}>
                Design beautiful printed menus with 5 professional templates. Add categories, items and prices — then download as PDF instantly.
              </p>
              <button
                onClick={() => {
                  document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 32px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <FaUtensils /> Start Designing Your Menu <FaArrowRight />
              </button>
            </div>
          </section>

          {/* ── Tool Section ───────────────────────────────────────────── */}
          <section id="tool-section" style={{ padding: isMobile ? '32px 16px' : '56px 32px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

              {/* Mobile tab switcher */}
              {isMobile && (
                <div style={{
                  display: 'flex',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '10px',
                  padding: '4px',
                  marginBottom: '20px',
                }}>
                  {[{ key: 'edit', label: 'Edit', icon: <FaEdit /> }, { key: 'preview', label: 'Preview', icon: <FaEye /> }].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
                        color: activeTab === tab.key ? '#16a34a' : '#6b7280',
                        boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '24px',
                alignItems: 'start',
              }}>
                {/* Left: Editor */}
                {(!isMobile || activeTab === 'edit') && (
                  <div>
                    <EditorPanel />
                    <button
                      onClick={handleDownloadPDF}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#111827',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginTop: '16px',
                      }}
                    >
                      <FaDownload /> Download Menu as PDF
                    </button>
                  </div>
                )}

                {/* Right: Preview */}
                {(!isMobile || activeTab === 'preview') && (
                  <div style={{ position: isMobile ? 'static' : 'sticky', top: '100px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaEye style={{ color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Live Preview — {selectedTemplate.name} Template
                        </span>
                      </div>
                      <button
                        onClick={handleDownloadPDF}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        <FaDownload /> Download PDF
                      </button>
                    </div>
                    <div style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                      maxHeight: isMobile ? 'none' : '80vh',
                      overflowY: 'auto',
                    }}>
                      <MenuPreview
                        restaurantName={restaurantName}
                        tagline={tagline}
                        currency={currency}
                        categories={categories}
                        template={selectedTemplate}
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '8px' }}>
                      The downloaded PDF will match this preview exactly
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── SEO Content ────────────────────────────────────────────── */}
          <section style={{
            padding: isMobile ? '40px 20px' : '64px 32px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e7eb',
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '48px',
              }}>
                {/* Article 1 */}
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                    How to Design a Restaurant Menu That Sells
                  </h2>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    A well-designed restaurant menu is one of the most powerful sales tools you own. Studies consistently show that the layout, typography, and even the paper texture of a menu influence what guests order — and how much they spend. Restaurants that invest in professional menu design see average check sizes increase by 5–15%.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    Start with your menu structure. Organize items into clear categories (Starters, Mains, Desserts, Drinks) and limit each category to 5–7 items. This reduces decision fatigue and helps your staff upsell effectively. Place your highest-margin items at the top of each category — guests tend to order the first and second items they see.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    Use visual anchors strategically. A single high-priced item on a page makes everything else seem more affordable by comparison — this is called &quot;anchoring.&quot; Boxes, icons, and subtle shading around signature dishes draw the eye without being heavy-handed. Photographs increase sales of featured items by up to 30%, but only use them if the image quality is excellent. Blurry or dimly lit food photos do more harm than good.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8 }}>
                    Typography matters more than most restaurateurs realize. Use a clean, readable font at a minimum of 11pt for item names. Descriptions in a lighter weight create hierarchy. Prices should be discreet — many design experts recommend right-aligning them away from the descriptions, or even omitting the currency symbol to reduce the psychological &quot;pain of paying.&quot; Keep your overall color palette to 2–3 colors maximum and ensure sufficient contrast for readability in dim lighting.
                  </p>
                </div>

                {/* Article 2 */}
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                    Menu Psychology: Layout & Pricing Tips
                  </h2>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    Restaurant menu psychology is the science of how menu design influences dining decisions. Cornell University&apos;s Center for Hospitality Research has published extensive studies on this topic, revealing that guests spend an average of just 109 seconds reading a menu before making decisions — making every design choice count.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    The &quot;golden triangle&quot; is a key concept: when guests open a two-page menu, their eyes naturally drift to the top right corner first, then the top left, then the center. These are your prime real estate zones — place your highest-margin dishes there. For single-page menus, the top third of the page gets the most attention.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8, marginBottom: '14px' }}>
                    Price presentation significantly impacts spending. Removing currency signs (&quot;250&quot; instead of &quot;₹250&quot;) reduces the pain of spending and increases average order value by up to 8%. Avoid listing prices in a column on the right side of the menu — this invites guests to scan prices and choose the cheapest option rather than what they actually want. Instead, embed prices naturally after the description.
                  </p>
                  <p style={{ color: '#374151', lineHeight: 1.8 }}>
                    Decoy pricing is another powerful technique. Offering a dish at ₹1,200, ₹900, and ₹650 makes the ₹900 option seem like the &quot;smart choice&quot; even though it&apos;s your most profitable. Similarly, adding a &quot;Chef&apos;s Special&quot; or &quot;House Favourite&quot; label to high-margin items can increase their sales by 25–30% without any change to the dish itself.
                  </p>
                </div>
              </div>

              {/* Article 3 — full width */}
              <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  Best Menu Sizes & Formats for Restaurants
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  {[
                    {
                      format: 'Single-Page A4',
                      best: 'Cafes, focused menus',
                      desc: 'Ideal for restaurants with fewer than 25 items. Clean, easy to read, low printing cost. Print double-sided for a 2-section menu.',
                    },
                    {
                      format: 'Bi-Fold (A4 folded)',
                      best: 'Casual dining, QSR',
                      desc: 'Four panels when folded from an A3 sheet. Great for separating Food / Beverages / Desserts / Specials into dedicated sections.',
                    },
                    {
                      format: 'Tri-Fold (A4 trifold)',
                      best: 'Takeaway, delivery menus',
                      desc: 'Six panels for detailed menus. Popular for takeaway menus that customers keep at home. Works well for large menu selections.',
                    },
                    {
                      format: 'Tall Narrow (4" x 14")',
                      best: 'Fine dining, cocktail bars',
                      desc: 'A sophisticated format that creates a premium, high-end feel. Often used for wine lists and tasting menus. Typically single-sided.',
                    },
                    {
                      format: 'Table Tent',
                      best: 'Specials, promotions',
                      desc: 'A folded card that stands upright on the table. Perfect for daily specials, dessert menus, or promotional offers alongside a main menu.',
                    },
                    {
                      format: 'Digital PDF Menu',
                      best: 'Online, QR code menus',
                      desc: 'A PDF version of your printed menu that guests access by scanning a QR code. Zero printing cost, update anytime. Combine with a QR code generator.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.format}</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' }}>Best for: {item.best}</div>
                      <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ Section ────────────────────────────────────────────── */}
          <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#f9fafb' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
                  Menu Design FAQs
                </h2>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  Common questions about restaurant menu design, sizing, and best practices
                </p>
              </div>
              <FAQAccordion />
            </div>
          </section>

          {/* ── CTA Section ────────────────────────────────────────────── */}
          <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{
                background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                borderRadius: '20px',
                padding: isMobile ? '36px 24px' : '56px 64px',
                color: 'white',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(22,163,74,0.2)',
                  border: '1px solid rgba(22,163,74,0.4)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  color: '#4ade80',
                  fontWeight: '600',
                  marginBottom: '20px',
                }}>
                  Running a restaurant?
                </div>
                <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', marginBottom: '14px' }}>
                  DineOpen handles billing, inventory, KOT & more
                </h2>
                <p style={{ fontSize: '16px', color: '#d1d5db', marginBottom: '28px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.7 }}>
                  From table orders to kitchen display to GST billing — DineOpen is the all-in-one restaurant POS built for Indian restaurants, cafes, and cloud kitchens.
                </p>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/pricing" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '15px',
                    textDecoration: 'none',
                  }}>
                    See Pricing <FaArrowRight />
                  </Link>
                  <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '15px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── Related Tools ──────────────────────────────────────────── */}
          <section style={{ padding: isMobile ? '40px 20px' : '64px 32px', backgroundColor: '#f9fafb' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
                Related Free Tools
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '16px',
              }}>
                {[
                  {
                    href: '/tools/menu-price-calculator',
                    label: 'Menu Price Calculator',
                    desc: 'Calculate ideal selling prices based on food cost & target margins',
                    icon: <FaTag />,
                    color: '#3b82f6',
                  },
                  {
                    href: '/tools/menu-engineering',
                    label: 'Menu Engineering',
                    desc: 'Classify your dishes as Stars, Puzzles, Plowhorses, or Dogs',
                    icon: <FaStar />,
                    color: '#8b5cf6',
                  },
                  {
                    href: '/tools/menu-description-generator',
                    label: 'Menu Description Generator',
                    desc: 'AI-powered mouth-watering descriptions for any dish',
                    icon: <FaEdit />,
                    color: '#ec4899',
                  },
                  {
                    href: '/tools/qr-menu-generator',
                    label: 'QR Menu Generator',
                    desc: 'Generate a QR code for your digital restaurant menu',
                    icon: <FaUtensils />,
                    color: '#16a34a',
                  },
                ].map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    style={{
                      display: 'block',
                      padding: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      textDecoration: 'none',
                      transition: 'box-shadow 0.15s',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      backgroundColor: `${tool.color}15`,
                      color: tool.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px',
                      marginBottom: '10px',
                    }}>
                      {tool.icon}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                      {tool.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                      {tool.desc}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <InternalLinks currentPath="/tools/menu-card-maker" variant="tool" />
        </div>
        <Footer />
      </div>
    </>
  );
}
