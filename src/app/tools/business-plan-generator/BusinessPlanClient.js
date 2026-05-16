'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';
import {
  FaFileAlt,
  FaCopy,
  FaDownload,
  FaRedo,
  FaChartLine,
  FaUtensils,
  FaBullhorn,
  FaCog,
  FaSearch,
  FaCheckCircle,
  FaLightbulb,
  FaChevronDown,
} from 'react-icons/fa';

const RESTAURANT_CONCEPTS = [
  'Fine Dining',
  'Casual Dining',
  'QSR / Fast Food',
  'Cafe / Coffee Shop',
  'Cloud Kitchen',
  'Food Truck',
  'Bar & Lounge',
  'Bakery',
  'Pizzeria',
];

const CURRENCIES = [
  { symbol: '₹', code: 'INR', label: 'INR (₹)' },
  { symbol: '$', code: 'USD', label: 'USD ($)' },
  { symbol: '£', code: 'GBP', label: 'GBP (£)' },
  { symbol: 'AED', code: 'AED', label: 'AED' },
  { symbol: 'QAR', code: 'QAR', label: 'QAR' },
];

const TARGET_MARKETS = [
  'Families',
  'Young Professionals',
  'Students',
  'Tourists',
  'Corporate',
  'Premium Diners',
];

const TABS = [
  { id: 'executive', label: 'Executive Summary', icon: <FaFileAlt /> },
  { id: 'market', label: 'Market Analysis', icon: <FaSearch /> },
  { id: 'menu', label: 'Menu Strategy', icon: <FaUtensils /> },
  { id: 'financial', label: 'Financial Projections', icon: <FaChartLine /> },
  { id: 'operations', label: 'Operations Plan', icon: <FaCog /> },
  { id: 'marketing', label: 'Marketing Plan', icon: <FaBullhorn /> },
];

const FAQ_ITEMS = [
  {
    q: 'Do I need a business plan to open a restaurant?',
    a: 'Yes — a business plan is essential for opening a restaurant. It forces you to think through your concept, target market, financial projections, and operations before you spend a rupee or dollar. More practically, banks, investors, and landlords will almost always ask for one. A solid restaurant business plan shows you understand the risks and have a clear path to profitability.',
  },
  {
    q: 'How long should a restaurant business plan be?',
    a: 'A complete restaurant business plan is typically 15-30 pages. It should cover: executive summary (1-2 pages), company overview, market analysis (3-5 pages), menu strategy, management team, marketing plan, operations plan, and financial projections (3-5 pages including P&L, cash flow, and balance sheet for 3 years). For investors or bank loans, a longer, more detailed plan is better.',
  },
  {
    q: 'What financial projections should I include?',
    a: 'Your restaurant business plan should include: (1) Startup cost breakdown — one-time investment needed to open; (2) Monthly P&L projection for 3 years; (3) Break-even analysis; (4) Cash flow statement; and (5) ROI calculation. Key benchmarks to target: food cost 28-35%, labor cost 25-35%, rent 6-10% of revenue.',
  },
  {
    q: 'How do I estimate restaurant startup costs?',
    a: 'Restaurant startup costs include: interior renovation & design (30-40% of budget), kitchen equipment (15-25%), security deposit & advance rent (10-20%), licenses & permits (2-5%), initial inventory (3-5%), staff training & pre-opening salaries (5-10%), marketing & branding (3-5%), and miscellaneous/contingency (10-15%). In India, a small restaurant needs ₹8-15 lakhs; medium needs ₹20-40 lakhs. In the USA, expect $150,000-$500,000 for a small to mid-size concept.',
  },
  {
    q: 'Can I use this business plan for investors?',
    a: 'Yes — the AI-generated business plan from DineOpen provides a strong starting framework. For investor presentations, supplement it with your own verified local market data, actual vendor quotes, personal financial statements, legal entity details, and a compelling pitch deck. The plan gives you the structure — you add the hyper-local specifics that make investors confident.',
  },
];

// Parse markdown-like content into React elements
function renderFormattedContent(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} style={{ margin: '0 0 16px 0', paddingLeft: '24px', color: '#374151', lineHeight: '1.8' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '6px', fontSize: '15px' }}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(idx);
      return;
    }

    // H2-style: starts with ##
    if (trimmed.startsWith('## ')) {
      flushList(idx);
      elements.push(
        <h3 key={idx} style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '24px 0 10px', borderBottom: '2px solid #f3f4f6', paddingBottom: '8px' }}>
          {trimmed.replace(/^## /, '')}
        </h3>
      );
    }
    // H3-style: starts with ###
    else if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(
        <h4 key={idx} style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '20px 0 8px' }}>
          {trimmed.replace(/^### /, '')}
        </h4>
      );
    }
    // Bold line (entire line is **bold**)
    else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      flushList(idx);
      elements.push(
        <p key={idx} style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '16px 0 6px' }}>
          {trimmed.slice(2, -2)}
        </p>
      );
    }
    // Bullet point
    else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-•]\s+/, '');
      // Inline bold in bullet
      listItems.push(renderInlineBold(content));
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      flushList(idx);
      const content = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <p key={idx} style={{ fontSize: '15px', color: '#374151', margin: '6px 0', lineHeight: '1.7', paddingLeft: '8px', borderLeft: '3px solid #7c3aed', paddingLeft: '12px' }}>
          <strong style={{ color: '#111827' }}>{trimmed.match(/^\d+\./)[0]}</strong> {renderInlineBold(content)}
        </p>
      );
    }
    // Regular paragraph
    else {
      flushList(idx);
      elements.push(
        <p key={idx} style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 12px' }}>
          {renderInlineBold(trimmed)}
        </p>
      );
    }
  });

  flushList('end');
  return elements;
}

function renderInlineBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#111827' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Parse the full AI response into 6 tab sections
function parsePlanSections(rawText) {
  if (!rawText) return {};

  const sectionKeys = {
    executive: ['executive summary', 'executive'],
    market: ['market analysis', 'market research', 'market'],
    menu: ['menu strategy', 'menu plan', 'menu'],
    financial: ['financial projections', 'financial plan', 'financials', 'financial'],
    operations: ['operations plan', 'operational plan', 'operations'],
    marketing: ['marketing plan', 'marketing strategy', 'marketing'],
  };

  const sections = {};

  // Try to split by common heading patterns
  const headingPatterns = [
    /^#{1,3}\s+(.+)$/gm,
    /^\*{2}(\d+\.\s*.+)\*{2}$/gm,
    /^(\d+\.\s+[A-Z].+)$/gm,
  ];

  let splitParts = null;

  // Try heading-based split
  const headingRegex = /(?=^#{1,3}\s+|\n#{1,3}\s+)/m;
  if (rawText.includes('##') || rawText.includes('# ')) {
    splitParts = rawText.split(/\n(?=#{1,3} )/);
  } else {
    // Fallback: try splitting by numbered sections
    splitParts = rawText.split(/\n(?=\d+\.\s+[A-Z])/);
  }

  splitParts.forEach((part) => {
    const firstLine = part.split('\n')[0].toLowerCase().replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim();

    for (const [key, aliases] of Object.entries(sectionKeys)) {
      if (aliases.some(alias => firstLine.includes(alias))) {
        sections[key] = (sections[key] || '') + '\n' + part;
        break;
      }
    }
  });

  // If sections are sparse, distribute evenly across 6 tabs
  const filledCount = Object.keys(sections).length;
  if (filledCount < 3) {
    const chunkSize = Math.ceil(rawText.length / 6);
    const keys = ['executive', 'market', 'menu', 'financial', 'operations', 'marketing'];
    keys.forEach((key, i) => {
      sections[key] = rawText.slice(i * chunkSize, (i + 1) * chunkSize);
    });
  }

  return sections;
}

export default function BusinessPlanClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [concept, setConcept] = useState('Casual Dining');
  const [cuisineType, setCuisineType] = useState('');
  const [location, setLocation] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [targetMarkets, setTargetMarkets] = useState([]);
  const [generatedText, setGeneratedText] = useState('');
  const [planSections, setPlanSections] = useState({});
  const [activeTab, setActiveTab] = useState('executive');
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isSkeletonVisible, setIsSkeletonVisible] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('business-plan');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleTargetMarket = (market) => {
    setTargetMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  const handleGenerate = async () => {
    if (!cuisineType.trim()) {
      alert('Please enter your cuisine type (e.g., North Indian, Italian, Multi-cuisine)');
      return;
    }
    if (!location.trim()) {
      alert('Please enter your restaurant location (city or area)');
      return;
    }

    setIsSkeletonVisible(true);
    const currencyObj = CURRENCIES.find(c => c.code === currency);

    const result = await generate({
      concept,
      cuisineType,
      location,
      seatingCapacity: seatingCapacity ? `${seatingCapacity} seats` : 'not specified',
      budget: budget ? `${currencyObj?.symbol || ''}${budget}` : 'not specified',
      targetMarkets: targetMarkets.length > 0 ? targetMarkets.join(', ') : 'General public',
    });

    setIsSkeletonVisible(false);

    if (result) {
      setGeneratedText(result);
      setPlanSections(parsePlanSections(result));
      setActiveTab('executive');
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant-business-plan-${concept.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const hasPlan = generatedText.length > 0;

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#faf5ff', paddingTop: '80px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
          color: 'white',
          padding: isMobile ? '48px 20px' : '80px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }} />
          <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 18px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              fontSize: '13px',
              marginBottom: '22px',
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: '500',
              letterSpacing: '0.3px',
            }}>
              <FaLightbulb style={{ fontSize: '12px' }} />
              AI-Powered — Free &bull; No Sign-up Required
            </div>
            <h1 style={{ fontSize: isMobile ? '30px' : '46px', fontWeight: '800', marginBottom: '18px', lineHeight: '1.15', letterSpacing: '-0.5px' }}>
              Restaurant Business Plan Generator
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.92, maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Get a complete, investor-ready business plan in minutes. Financial projections, market analysis, menu strategy — all AI-generated for your specific concept.
            </p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '14px', opacity: 0.88 }}>
              {['6 detailed sections', 'Financial projections', 'Download as text', 'India & global markets'].map((feat, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCheckCircle style={{ fontSize: '12px' }} />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Generator Section ── */}
        <section style={{ padding: isMobile ? '40px 16px' : '64px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: hasPlan && !isMobile ? '420px 1fr' : '1fr', gap: '32px', alignItems: 'start' }}>

              {/* Input Form */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: isMobile ? '24px 20px' : '36px',
                boxShadow: '0 8px 40px rgba(124,58,237,0.08)',
                border: '1px solid #f3e8ff',
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '28px' }}>
                  Tell us about your restaurant
                </h2>

                {/* Restaurant Concept */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Restaurant concept</label>
                  <select
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                  >
                    {RESTAURANT_CONCEPTS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Cuisine Type */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Cuisine type <span style={{ color: '#ef4444', fontWeight: '400' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    placeholder="e.g., North Indian, Italian, Multi-cuisine, Pan-Asian"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                </div>

                {/* Location */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Location (city / area) <span style={{ color: '#ef4444', fontWeight: '400' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Bengaluru, Mumbai, Dubai, London"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                </div>

                {/* Seating + Budget row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>Seating capacity</label>
                    <input
                      type="number"
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(e.target.value)}
                      placeholder="e.g., 40"
                      min="1"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Investment budget</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{
                          padding: '12px 8px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          fontSize: '13px',
                          color: '#374151',
                          outline: 'none',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          flexShrink: 0,
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g., 2000000"
                        min="0"
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                      />
                    </div>
                  </div>
                </div>

                {/* Target Market */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={labelStyle}>Target market <span style={{ color: '#9ca3af', fontWeight: '400' }}>(select all that apply)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TARGET_MARKETS.map(market => {
                      const selected = targetMarkets.includes(market);
                      return (
                        <button
                          key={market}
                          onClick={() => toggleTargetMarket(market)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selected ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                            backgroundColor: selected ? '#f5f3ff' : 'white',
                            color: selected ? '#7c3aed' : '#4b5563',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {selected && <FaCheckCircle style={{ marginRight: '5px', fontSize: '11px' }} />}
                          {market}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isGenerating
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '16px',
                    boxShadow: isGenerating ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontFamily: 'inherit',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Generating Your Plan...
                    </>
                  ) : (
                    <>
                      <FaFileAlt />
                      Generate Business Plan
                    </>
                  )}
                </button>

                {remaining !== null && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                    {remaining} free generation{remaining !== 1 ? 's' : ''} remaining today
                  </p>
                )}

                {error && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#dc2626',
                    lineHeight: '1.5',
                  }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Results Panel */}
              {(hasPlan || isSkeletonVisible || isGenerating) && (
                <div>
                  {(isGenerating || isSkeletonVisible) && !hasPlan ? (
                    // Skeleton loader
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      padding: isMobile ? '24px 20px' : '36px',
                      boxShadow: '0 8px 40px rgba(124,58,237,0.08)',
                      border: '1px solid #f3e8ff',
                    }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                        {TABS.map((tab) => (
                          <div key={tab.id} style={{ height: '36px', width: '120px', backgroundColor: '#f3f4f6', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                      </div>
                      {[1, 0.7, 0.9, 0.6, 0.8, 0.75, 0.5, 0.85].map((w, i) => (
                        <div key={i} style={{
                          height: i === 0 ? '24px' : '16px',
                          width: `${w * 100}%`,
                          backgroundColor: i === 0 ? '#e9d5ff' : '#f3f4f6',
                          borderRadius: '6px',
                          marginBottom: i === 0 ? '16px' : '10px',
                          animation: 'pulse 1.5s ease-in-out infinite',
                          animationDelay: `${i * 0.1}s`,
                        }} />
                      ))}
                      <p style={{ textAlign: 'center', color: '#7c3aed', fontSize: '14px', fontWeight: '600', marginTop: '24px' }}>
                        AI is writing your business plan... this takes 15-30 seconds
                      </p>
                    </div>
                  ) : hasPlan ? (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      boxShadow: '0 8px 40px rgba(124,58,237,0.08)',
                      border: '1px solid #f3e8ff',
                      overflow: 'hidden',
                    }}>
                      {/* Tab Header */}
                      <div style={{
                        borderBottom: '1px solid #f3f4f6',
                        padding: isMobile ? '16px 16px 0' : '20px 32px 0',
                        backgroundColor: '#fdfbff',
                        overflowX: 'auto',
                      }}>
                        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
                          {TABS.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid #7c3aed' : '3px solid transparent',
                                backgroundColor: 'transparent',
                                color: activeTab === tab.id ? '#7c3aed' : '#6b7280',
                                fontWeight: activeTab === tab.id ? '700' : '500',
                                fontSize: '13px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                                fontFamily: 'inherit',
                                paddingBottom: '12px',
                              }}
                            >
                              <span style={{ fontSize: '12px' }}>{tab.icon}</span>
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div style={{ padding: isMobile ? '24px 20px' : '32px' }}>
                        <div style={{ minHeight: '300px' }}>
                          {planSections[activeTab] ? (
                            <div>{renderFormattedContent(planSections[activeTab])}</div>
                          ) : (
                            // Fallback: show raw text for this section
                            <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7' }}>
                              {renderFormattedContent(generatedText)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        borderTop: '1px solid #f3f4f6',
                        padding: isMobile ? '16px 20px' : '20px 32px',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        backgroundColor: '#fdfbff',
                      }}>
                        <button
                          onClick={handleCopyAll}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: copied ? '#7c3aed' : 'white',
                            color: copied ? 'white' : '#7c3aed',
                            border: '2px solid #7c3aed',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <FaCopy />
                          {copied ? 'Copied!' : 'Copy All'}
                        </button>

                        <button
                          onClick={handleDownload}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: downloaded ? '#059669' : 'white',
                            color: downloaded ? 'white' : '#059669',
                            border: `2px solid ${downloaded ? '#059669' : '#10b981'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <FaDownload />
                          {downloaded ? 'Downloaded!' : 'Download as Text'}
                        </button>

                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#6b7280',
                            border: '2px solid #e5e7eb',
                            borderRadius: '10px',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.15s',
                            fontFamily: 'inherit',
                          }}
                        >
                          <FaRedo />
                          Generate Again
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Empty state — shown only when no plan and not loading */}
              {!hasPlan && !isGenerating && !isSkeletonVisible && (
                <div style={{
                  display: isMobile ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 40px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '2px dashed #e9d5ff',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '80px', height: '80px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)',
                    borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '36px',
                    marginBottom: '20px',
                  }}>
                    📄
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                    Your business plan will appear here
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', maxWidth: '280px' }}>
                    Fill in your restaurant details on the left and click Generate to create your complete plan
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '28px', textAlign: 'left' }}>
                    {['Executive Summary & Vision', 'Market Analysis & Competition', 'Menu Strategy & Pricing', 'Financial Projections (3-year)', 'Operations & Staffing Plan', 'Marketing & Growth Strategy'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6b7280' }}>
                        <FaCheckCircle style={{ color: '#c4b5fd', flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SEO Content Section ── */}
        <section style={{ padding: isMobile ? '48px 16px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Article 1 */}
            <article style={{ marginBottom: '64px' }}>
              <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#111827', marginBottom: '20px', lineHeight: '1.3' }}>
                How to Write a Restaurant Business Plan: Step-by-Step
              </h2>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                A restaurant business plan is a structured document that outlines your vision, market strategy, operational approach, and financial roadmap. Writing one forces you to pressure-test your idea before investing capital. Here&apos;s how to build each section:
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>1. Executive Summary</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                Write this section last. It should distill your entire plan into 1-2 pages: your restaurant concept, the gap in the market you&apos;re filling, your target customer, and the total investment required. This is what investors read first — make it compelling. Include your restaurant name, location, cuisine type, and a one-line mission statement.
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>2. Market Analysis</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                Research your local dining market thoroughly. Identify 3-5 direct competitors, analyze their pricing, menu, reviews, and foot traffic. Estimate total addressable market (TAM) using census data and average spend per dining occasion. In India, the food services market is projected to reach ₹7.76 lakh crore by 2028 — but your plan should focus on your local market. Include a SWOT analysis: your concept&apos;s strengths, weaknesses, opportunities, and threats.
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>3. Menu Strategy</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                Your menu should reflect your concept, target customer, kitchen capability, and price positioning. Include a sample menu with 20-30 items organized by category. Apply menu engineering: identify star items (high profit, high popularity), plowhorses (popular but low margin), puzzles (high margin, low popularity), and dogs (remove these). Include food cost targets — most successful restaurants maintain food cost at 28-35% of menu price.
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>4. Financial Projections</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                This is the most critical section for investors. Build a 3-year P&L with monthly detail for Year 1. Include: startup cost breakdown, projected daily covers x average spend = monthly revenue, cost of goods sold (food + beverage), gross profit, operating expenses (rent, labor, utilities, marketing), EBITDA, and net profit. Also include a break-even analysis showing the monthly revenue needed to cover all fixed costs. Conservative, realistic assumptions are more credible than optimistic projections.
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>5. Operations Plan</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                Detail day-to-day operations: hours, staffing structure (chef, sous chef, servers, cashier), supplier relationships, inventory management, food safety protocols, and technology stack (POS system, reservation platform, delivery integration). Specify your organizational chart and the roles of founding team members.
              </p>

              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1f2937', margin: '28px 0 10px' }}>6. Marketing Plan</h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8', marginBottom: '16px' }}>
                Outline your pre-launch, launch, and ongoing marketing strategy. Include: brand identity (name, logo, colors), social media plan (Instagram, Google My Business), delivery platform strategy (Swiggy/Zomato or Uber Eats/DoorDash), loyalty program, and PR approach. Set measurable KPIs: target reviews, follower counts, and monthly customer acquisition cost.
              </p>
            </article>

            {/* Article 2 */}
            <article style={{ marginBottom: '64px', padding: '36px', backgroundColor: '#fdf4ff', borderRadius: '16px', border: '1px solid #f3e8ff' }}>
              <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                Common Mistakes in Restaurant Business Plans
              </h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
                Even experienced restaurateurs make costly planning mistakes. Avoid these:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Underestimating working capital', desc: 'Most restaurants take 6-12 months to reach break-even. Plan for 6 months of operating expenses beyond your startup costs. This is the #1 reason restaurants fail in year one.' },
                  { title: 'Overly optimistic revenue assumptions', desc: 'New restaurants rarely hit capacity in the first 3-6 months. Use 40-50% seat occupancy for Year 1 projections, growing to 60-70% by Year 2. Investors will flag unrealistic numbers immediately.' },
                  { title: 'Ignoring labor costs', desc: 'Labor (including owner salary) should not exceed 35% of revenue. Factor in benefits, payroll taxes, and overtime. Many plans forget to include the owner\'s own salary as a cost.' },
                  { title: 'No competitive differentiation', desc: 'Saying "we will serve great food" is not a strategy. Define clearly what makes your restaurant different: unique recipes, a memorable dining experience, better value, or exclusive partnerships.' },
                  { title: 'Skipping the operations section', desc: 'Banks and experienced investors know that execution is everything. A vague operations section signals inexperience. Be specific about supplier relationships, staff structure, and daily SOPs.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '6px', flexShrink: 0, backgroundColor: '#c026d3', borderRadius: '3px', alignSelf: 'stretch' }} />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</p>
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.7' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Article 3 */}
            <article>
              <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                How Much Does It Cost to Open a Restaurant?
              </h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' }}>
                Startup costs vary significantly by country, city, and restaurant type. Here are realistic ranges to include in your business plan:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                  {
                    country: 'India',
                    flag: '🇮🇳',
                    ranges: [
                      { type: 'Small Cafe / QSR (10-20 seats)', cost: '₹8 – ₹15 Lakhs' },
                      { type: 'Casual Dining (30-60 seats)', cost: '₹20 – ₹40 Lakhs' },
                      { type: 'Fine Dining / Bar (60+ seats)', cost: '₹60 Lakhs – ₹1.5 Cr' },
                    ],
                  },
                  {
                    country: 'USA',
                    flag: '🇺🇸',
                    ranges: [
                      { type: 'Small Cafe / QSR', cost: '$80K – $175K' },
                      { type: 'Casual Dining', cost: '$175K – $500K' },
                      { type: 'Fine Dining / Full Service', cost: '$500K – $1.5M' },
                    ],
                  },
                  {
                    country: 'UK',
                    flag: '🇬🇧',
                    ranges: [
                      { type: 'Small Cafe (15-25 seats)', cost: '£50K – £100K' },
                      { type: 'Casual Dining (30-60 seats)', cost: '£100K – £300K' },
                      { type: 'Fine Dining / Restaurant', cost: '£300K – £700K' },
                    ],
                  },
                  {
                    country: 'UAE (Dubai)',
                    flag: '🇦🇪',
                    ranges: [
                      { type: 'Small Cafeteria / QSR', cost: 'AED 250K – 400K' },
                      { type: 'Casual Dining', cost: 'AED 500K – 1M' },
                      { type: 'Premium / Fine Dining', cost: 'AED 1.5M – 4M' },
                    ],
                  },
                ].map((country, i) => (
                  <div key={i} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                      {country.flag} {country.country}
                    </p>
                    {country.ranges.map((range, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', paddingBottom: '8px', borderBottom: j < country.ranges.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', flex: 1 }}>{range.type}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed', flexShrink: 0, marginLeft: '12px' }}>{range.cost}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', backgroundColor: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <strong style={{ color: '#92400e' }}>Pro tip:</strong> Always add 20-30% to your estimated startup cost as a contingency buffer. Renovation overruns, delayed equipment, and pre-opening expenses consistently exceed initial estimates. Also use our <Link href="/tools/startup-cost-calculator" style={{ color: '#7c3aed', fontWeight: '600' }}>Restaurant Startup Cost Calculator</Link> for a detailed country-specific breakdown.
              </p>
            </article>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section style={{ padding: isMobile ? '48px 16px' : '80px 20px', backgroundColor: '#faf5ff' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '800', color: '#111827', marginBottom: '12px', textAlign: 'center' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
              Everything you need to know about restaurant business plans
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e9d5ff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', paddingRight: '16px', lineHeight: '1.4' }}>
                      {faq.q}
                    </span>
                    <FaChevronDown style={{
                      fontSize: '14px',
                      color: '#7c3aed',
                      flexShrink: 0,
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }} />
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8', borderTop: '1px solid #f3e8ff' }}>
                      <div style={{ paddingTop: '16px' }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section style={{
          padding: isMobile ? '48px 16px' : '80px 20px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
            <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.3' }}>
              Ready to Launch? DineOpen Powers Your POS from Day One
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.88, marginBottom: '32px', lineHeight: '1.7' }}>
              Once your business plan is ready, manage everything with DineOpen — billing, orders, inventory, KOT, staff management, and online ordering. Free to start, no hardware required.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: 'white',
                color: '#312e81',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}>
                Start Free Trial
              </Link>
              <Link href="/tools/startup-cost-calculator" style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                Calculate Startup Costs
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
              Related Planning Tools
            </h2>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '36px' }}>
              Use these free tools to build out the financial sections of your business plan
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                {
                  href: '/tools/startup-cost-calculator',
                  icon: '💰',
                  label: 'Startup Cost Calculator',
                  desc: 'Estimate total investment by country',
                },
                {
                  href: '/tools/break-even-calculator',
                  icon: '📊',
                  label: 'Break-Even Calculator',
                  desc: 'Find your monthly revenue target',
                },
                {
                  href: '/tools/revenue-forecast-calculator',
                  icon: '📈',
                  label: 'Revenue Forecast',
                  desc: 'Project 3-year revenue scenarios',
                },
                {
                  href: '/tools/roi-calculator',
                  icon: '🎯',
                  label: 'ROI Calculator',
                  desc: 'Calculate investor return on investment',
                },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  style={{
                    display: 'block',
                    padding: '24px 20px',
                    backgroundColor: '#faf5ff',
                    borderRadius: '16px',
                    border: '1px solid #f3e8ff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.12)';
                    e.currentTarget.style.borderColor = '#c4b5fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f3e8ff';
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{tool.icon}</div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px', lineHeight: '1.3' }}>{tool.label}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <InternalLinks currentPath="/tools/business-plan-generator" variant="tool" />

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}
