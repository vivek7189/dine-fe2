'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

// ─── Options ──────────────────────────────────────────────────────────────────

const cuisineOptions = [
  { value: 'indian', label: 'Indian' },
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'american', label: 'American' },
  { value: 'french', label: 'French' },
  { value: 'thai', label: 'Thai' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'cafe', label: 'Cafe / Coffee' },
  { value: 'bar', label: 'Bar / Pub' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'vegan', label: 'Vegan' },
];

const styleOptions = [
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'modern', label: 'Modern' },
  { value: 'playful', label: 'Playful' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'bold', label: 'Bold' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'rustic', label: 'Rustic' },
];

// ─── Cuisine Icons (SVG paths) ───────────────────────────────────────────────

function getCuisineIcon(cuisine, color) {
  const icons = {
    indian: `<g transform="translate(120,80)"><circle cx="30" cy="30" r="28" fill="none" stroke="${color}" stroke-width="3"/><path d="M15,30 Q30,10 45,30 Q30,50 15,30Z" fill="${color}" opacity="0.3"/><circle cx="30" cy="28" r="5" fill="${color}"/></g>`,
    italian: `<g transform="translate(120,80)"><path d="M20,15 L20,50 M25,12 Q30,45 35,50 M40,15 L40,50" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="30" cy="52" rx="15" ry="4" fill="${color}" opacity="0.3"/></g>`,
    chinese: `<g transform="translate(120,80)"><line x1="15" y1="15" x2="25" y2="55" stroke="${color}" stroke-width="3" stroke-linecap="round"/><line x1="35" y1="15" x2="45" y2="55" stroke="${color}" stroke-width="3" stroke-linecap="round"/><path d="M10,20 L50,20" stroke="${color}" stroke-width="2" opacity="0.5"/></g>`,
    japanese: `<g transform="translate(120,80)"><rect x="15" y="20" width="30" height="14" rx="7" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="2"/><circle cx="22" cy="27" r="3" fill="${color}"/><circle cx="30" cy="27" r="3" fill="${color}"/><circle cx="38" cy="27" r="3" fill="${color}"/><rect x="20" y="38" width="20" height="8" rx="2" fill="none" stroke="${color}" stroke-width="2"/></g>`,
    mexican: `<g transform="translate(120,80)"><path d="M15,45 Q30,10 45,45 Z" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2"/><line x1="30" y1="15" x2="30" y2="45" stroke="${color}" stroke-width="2"/><circle cx="30" cy="30" r="4" fill="${color}"/></g>`,
    american: `<g transform="translate(120,80)"><ellipse cx="30" cy="35" rx="20" ry="10" fill="${color}" opacity="0.3"/><path d="M10,35 Q30,15 50,35" fill="none" stroke="${color}" stroke-width="3"/><line x1="15" y1="35" x2="45" y2="35" stroke="${color}" stroke-width="2"/></g>`,
    french: `<g transform="translate(120,80)"><path d="M20,50 L20,25 Q20,10 30,10 Q40,10 40,25 L40,50" fill="none" stroke="${color}" stroke-width="3"/><line x1="15" y1="50" x2="45" y2="50" stroke="${color}" stroke-width="2"/><circle cx="30" cy="18" r="4" fill="${color}" opacity="0.5"/></g>`,
    thai: `<g transform="translate(120,80)"><path d="M15,40 Q20,20 30,15 Q40,20 45,40" fill="none" stroke="${color}" stroke-width="3"/><ellipse cx="30" cy="42" rx="18" ry="8" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2"/><path d="M25,15 Q30,5 35,15" fill="${color}" opacity="0.5"/></g>`,
    mediterranean: `<g transform="translate(120,80)"><ellipse cx="30" cy="30" rx="8" ry="12" fill="${color}" opacity="0.3"/><path d="M30,18 Q25,10 30,5 Q35,10 30,18" fill="${color}"/><path d="M22,25 Q15,22 18,30" stroke="${color}" stroke-width="2" fill="none"/><path d="M38,25 Q45,22 42,30" stroke="${color}" stroke-width="2" fill="none"/></g>`,
    cafe: `<g transform="translate(120,80)"><rect x="18" y="22" width="24" height="28" rx="3" fill="none" stroke="${color}" stroke-width="3"/><path d="M42,28 Q52,28 52,36 Q52,44 42,44" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M22,22 Q24,15 30,14 Q36,15 38,22" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/></g>`,
    bar: `<g transform="translate(120,80)"><path d="M20,15 L40,15 L35,35 L35,48 L25,48 L25,35 Z" fill="none" stroke="${color}" stroke-width="3"/><line x1="20" y1="48" x2="40" y2="48" stroke="${color}" stroke-width="3"/><circle cx="35" cy="22" r="3" fill="${color}"/></g>`,
    bakery: `<g transform="translate(120,80)"><path d="M15,40 Q15,25 22,20 Q30,15 38,20 Q45,25 45,40" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2.5"/><line x1="15" y1="40" x2="45" y2="40" stroke="${color}" stroke-width="2"/><path d="M22,40 L22,50 M30,40 L30,50 M38,40 L38,50" stroke="${color}" stroke-width="1.5" opacity="0.5"/></g>`,
    pizza: `<g transform="translate(120,80)"><path d="M30,10 L50,50 L10,50 Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="3"/><circle cx="25" cy="38" r="4" fill="${color}" opacity="0.5"/><circle cx="35" cy="42" r="3" fill="${color}" opacity="0.5"/><circle cx="30" cy="28" r="3" fill="${color}" opacity="0.5"/></g>`,
    seafood: `<g transform="translate(120,80)"><ellipse cx="30" cy="30" rx="20" ry="10" fill="${color}" opacity="0.2"/><path d="M10,30 Q20,20 30,30 Q40,40 50,30" fill="none" stroke="${color}" stroke-width="3"/><circle cx="18" cy="28" r="2" fill="${color}"/><path d="M45,28 L55,22 M45,32 L55,38" stroke="${color}" stroke-width="2"/></g>`,
    vegan: `<g transform="translate(120,80)"><path d="M30,50 Q30,30 20,15" fill="none" stroke="${color}" stroke-width="3"/><path d="M20,15 Q30,20 35,35 Q38,25 45,20 Q35,30 30,50" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="2"/></g>`,
  };
  return icons[cuisine] || icons.cafe;
}

// ─── Font by Style ───────────────────────────────────────────────────────────

function getFontFamily(style) {
  const fonts = {
    minimalist: 'Arial, sans-serif',
    vintage: 'Georgia, serif',
    modern: 'Helvetica, Arial, sans-serif',
    playful: 'Comic Sans MS, cursive',
    luxury: 'Times New Roman, serif',
    bold: 'Impact, sans-serif',
    elegant: 'Garamond, serif',
    rustic: 'Courier New, monospace',
  };
  return fonts[style] || 'Arial, sans-serif';
}

// ─── Logo Generation ─────────────────────────────────────────────────────────

function generateLogos(name, cuisine, style, primaryColor, secondaryColor) {
  const icon = getCuisineIcon(cuisine, primaryColor);
  const fontFamily = getFontFamily(style);
  const truncName = name.length > 16 ? name.slice(0, 16) : name;
  const templates = [];

  // Template 1: Circle badge with icon, name below
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <circle cx="150" cy="130" r="80" fill="none" stroke="${primaryColor}" stroke-width="4"/>
    ${icon.replace('translate(120,80)', 'translate(120,95)')}
    <text x="150" y="240" text-anchor="middle" font-family="${fontFamily}" font-size="22" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <line x1="100" y1="250" x2="200" y2="250" stroke="${primaryColor}" stroke-width="2"/>
  </svg>`);

  // Template 2: Horizontal layout - icon left, text right
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <rect x="20" y="100" width="260" height="100" rx="12" fill="none" stroke="${primaryColor}" stroke-width="3"/>
    ${icon.replace('translate(120,80)', 'translate(25,115)')}
    <text x="170" y="155" text-anchor="middle" font-family="${fontFamily}" font-size="20" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <text x="170" y="175" text-anchor="middle" font-family="${fontFamily}" font-size="10" letter-spacing="3" fill="${primaryColor}">${(cuisineOptions.find(c => c.value === cuisine)?.label || '').toUpperCase()}</text>
  </svg>`);

  // Template 3: Shield shape with icon and text
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <path d="M150,30 L250,70 L250,180 Q250,260 150,280 Q50,260 50,180 L50,70 Z" fill="none" stroke="${primaryColor}" stroke-width="4"/>
    ${icon.replace('translate(120,80)', 'translate(120,70)')}
    <text x="150" y="210" text-anchor="middle" font-family="${fontFamily}" font-size="18" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <text x="150" y="235" text-anchor="middle" font-family="${fontFamily}" font-size="10" fill="${primaryColor}" letter-spacing="2">${styleOptions.find(s => s.value === style)?.label.toUpperCase() || ''}</text>
  </svg>`);

  // Template 4: Stacked vertical - icon on top, name below, line separators
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    ${icon.replace('translate(120,80)', 'translate(120,60)')}
    <line x1="100" y1="155" x2="200" y2="155" stroke="${primaryColor}" stroke-width="2"/>
    <text x="150" y="185" text-anchor="middle" font-family="${fontFamily}" font-size="22" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <line x1="100" y1="200" x2="200" y2="200" stroke="${primaryColor}" stroke-width="2"/>
    <text x="150" y="230" text-anchor="middle" font-family="${fontFamily}" font-size="11" letter-spacing="4" fill="${primaryColor}">${(cuisineOptions.find(c => c.value === cuisine)?.label || '').toUpperCase()}</text>
  </svg>`);

  // Template 5: Minimal text-only with stylized first letter
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <text x="150" y="140" text-anchor="middle" font-family="${fontFamily}" font-size="72" font-weight="bold" fill="${primaryColor}">${name.charAt(0).toUpperCase()}</text>
    <text x="150" y="185" text-anchor="middle" font-family="${fontFamily}" font-size="20" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <text x="150" y="210" text-anchor="middle" font-family="${fontFamily}" font-size="10" letter-spacing="3" fill="${primaryColor}">EST. 2024</text>
    <line x1="90" y1="155" x2="130" y2="155" stroke="${primaryColor}" stroke-width="1.5"/>
    <line x1="170" y1="155" x2="210" y2="155" stroke="${primaryColor}" stroke-width="1.5"/>
  </svg>`);

  // Template 6: Rectangular border with icon and text inside
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <rect x="40" y="60" width="220" height="180" rx="4" fill="none" stroke="${secondaryColor}" stroke-width="4"/>
    <rect x="48" y="68" width="204" height="164" rx="2" fill="none" stroke="${primaryColor}" stroke-width="1"/>
    ${icon.replace('translate(120,80)', 'translate(120,75)')}
    <text x="150" y="200" text-anchor="middle" font-family="${fontFamily}" font-size="18" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <text x="150" y="222" text-anchor="middle" font-family="${fontFamily}" font-size="10" letter-spacing="3" fill="${primaryColor}">${(cuisineOptions.find(c => c.value === cuisine)?.label || '').toUpperCase()}</text>
  </svg>`);

  // Template 7: Round seal with dots decoration
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <circle cx="150" cy="150" r="110" fill="none" stroke="${primaryColor}" stroke-width="4"/>
    <circle cx="150" cy="150" r="95" fill="none" stroke="${primaryColor}" stroke-width="1.5"/>
    ${icon.replace('translate(120,80)', 'translate(120,95)')}
    <text x="150" y="210" text-anchor="middle" font-family="${fontFamily}" font-size="16" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <circle cx="90" cy="195" r="3" fill="${primaryColor}"/><circle cx="210" cy="195" r="3" fill="${primaryColor}"/>
    <circle cx="80" cy="175" r="2" fill="${primaryColor}"/><circle cx="220" cy="175" r="2" fill="${primaryColor}"/>
    <circle cx="85" cy="155" r="2" fill="${primaryColor}"/><circle cx="215" cy="155" r="2" fill="${primaryColor}"/>
  </svg>`);

  // Template 8: Diamond shape with icon, text below
  templates.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <g transform="translate(150,130) rotate(45)">
      <rect x="-55" y="-55" width="110" height="110" fill="none" stroke="${primaryColor}" stroke-width="4" rx="4"/>
    </g>
    ${icon.replace('translate(120,80)', 'translate(120,90)')}
    <text x="150" y="250" text-anchor="middle" font-family="${fontFamily}" font-size="18" font-weight="bold" fill="${secondaryColor}">${truncName}</text>
    <text x="150" y="272" text-anchor="middle" font-family="${fontFamily}" font-size="10" fill="${primaryColor}" letter-spacing="2">${styleOptions.find(s => s.value === style)?.label.toUpperCase() || ''}</text>
  </svg>`);

  return templates;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What makes a good restaurant logo?',
    a: 'A good restaurant logo is memorable, scalable, and communicates your brand personality at a glance. It should work in both color and black-and-white, be readable at small sizes (on menus, receipts, app icons), and reflect your cuisine type and dining atmosphere. Use a maximum of 2-3 colors and a clean typeface. The most iconic restaurant logos are simple and instantly recognizable.',
  },
  {
    q: 'What colors work best for restaurant logos?',
    a: 'Red and orange stimulate appetite and create urgency — ideal for fast food and casual dining. Green signals freshness and health — great for vegan and farm-to-table concepts. Gold and deep burgundy convey luxury — perfect for fine dining. Black communicates sophistication for premium brands. Blue is rarely used in food businesses as it can suppress appetite, but works for seafood concepts.',
  },
  {
    q: 'Should my logo include food imagery?',
    a: 'Food imagery can quickly communicate your cuisine type and is popular for ethnic restaurants and specialty food businesses. However, overly literal food illustrations can feel dated. Many successful restaurants opt for abstract symbols or elegant typography instead. If you use food imagery, choose a stylized or geometric interpretation rather than a realistic illustration — it scales better and ages more gracefully.',
  },
  {
    q: 'How much does a professional restaurant logo cost?',
    a: 'Costs vary widely: a freelance designer on Fiverr charges ₹2,000–₹15,000 ($25–$200), a mid-level graphic designer typically charges ₹15,000–₹75,000 ($200–$1,000), and a professional branding agency can charge ₹75,000–₹5,00,000+ ($1,000–$6,000+). Free tools like DineOpen Logo Maker provide a professional starting point at zero cost. Many restaurateurs use free tools for launch and invest in professional branding once established.',
  },
  {
    q: 'Can I trademark a logo made with this tool?',
    a: 'Yes, you can attempt to trademark a logo created with this tool as the designs are generated based on your unique combination of name, colors, and style. However, trademark eligibility depends on distinctiveness. Before filing, conduct a trademark search on the USPTO (US) or IP India database. The cost of a trademark application in India ranges from ₹4,500–₹9,000 per class, while in the US it is $250–$350 per class.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogoMakerClient() {
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('indian');
  const [style, setStyle] = useState('minimalist');
  const [primaryColor, setPrimaryColor] = useState('#16a34a');
  const [secondaryColor, setSecondaryColor] = useState('#111827');
  const [logos, setLogos] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [taglines, setTaglines] = useState('');
  const svgRefs = useRef([]);

  const { generate, isGenerating, error, remaining } = useAITool('logo-suggest');

  const handleGenerate = () => {
    if (!restaurantName.trim()) {
      alert('Please enter your restaurant name');
      return;
    }
    const results = generateLogos(restaurantName, cuisine, style, primaryColor, secondaryColor);
    setLogos(results);
  };

  const handleSuggestTaglines = async () => {
    if (!restaurantName.trim()) {
      alert('Please enter your restaurant name first');
      return;
    }
    const result = await generate({
      restaurantName,
      cuisineType: cuisineOptions.find(c => c.value === cuisine)?.label || cuisine,
      style: styleOptions.find(s => s.value === style)?.label || style,
    });
    if (result) {
      setTaglines(result);
    }
  };

  const downloadSVG = (svgString, index) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${restaurantName || 'logo'}-template-${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              8 Templates + AI Taglines &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Logo Maker</h1>
            <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.6 }}>
              Create professional logo designs for your restaurant in seconds. Choose your style, colors, and cuisine — then download SVG templates instantly.
            </p>
          </div>
        </section>

        {/* Tool Section */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Form */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Customize Your Logo</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g., Spice Garden"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Cuisine Type
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {cuisineOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Logo Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {styleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Primary Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '48px', height: '40px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Secondary Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: '48px', height: '40px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
                    <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleGenerate}
                  style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}
                >
                  Generate Logos
                </button>
                <button
                  onClick={handleSuggestTaglines}
                  disabled={isGenerating}
                  style={{ padding: '14px 32px', background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '16px' }}
                >
                  {isGenerating ? 'Suggesting...' : 'Suggest Taglines (AI)'}
                </button>
              </div>

              {remaining !== null && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>{remaining} free AI generations remaining today</p>
              )}
              {error && (
                <p style={{ marginTop: '12px', fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>{error}</p>
              )}
            </div>

            {/* Taglines */}
            {taglines && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>AI-Suggested Taglines</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {taglines.split('\n').filter(l => l.trim()).map((line, i) => (
                    <div key={i} style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logo Grid */}
            {logos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {logos.map((svg, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div
                      ref={el => svgRefs.current[idx] = el}
                      dangerouslySetInnerHTML={{ __html: svg }}
                      style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>Template {idx + 1}</p>
                    <button
                      onClick={() => downloadSVG(svg, idx)}
                      style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      Download SVG
                    </button>
                  </div>
                ))}
              </div>
            )}

            {logos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</p>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>Enter your restaurant name and preferences, then click &quot;Generate Logos&quot; to see 8 professional template variations.</p>
              </div>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Restaurant Logo Design Tips</h2>
            <div style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>Your restaurant logo is often the first impression potential customers have of your brand. A well-designed logo communicates your cuisine type, dining atmosphere, and brand values in a single visual mark. Whether you are opening a fine dining establishment or a casual street food joint, investing time in your logo design pays dividends across every customer touchpoint.</p>
              <p style={{ marginBottom: '16px' }}>Keep your logo simple and versatile. It needs to look equally impressive on a large signboard, a small business card, a social media profile picture, and food delivery app listings. Overly complex designs with too many details lose clarity at smaller sizes. The best restaurant logos use clean lines and intentional negative space.</p>
              <p style={{ marginBottom: '16px' }}>Typography matters enormously in restaurant branding. A serif font conveys tradition and elegance, while sans-serif suggests modernity and cleanliness. Script fonts work well for bakeries and cafes but can be hard to read if overdone. Always ensure your restaurant name is legible even at small sizes.</p>
              <p>Consider how your logo will appear across different backgrounds. It should work on dark and light backgrounds, on printed menus, embroidered uniforms, packaging, and digital screens. Creating a monochrome version ensures flexibility across all applications.</p>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Best Restaurant Logo Examples</h2>
            <div style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>The world&apos;s most successful restaurant brands share common logo design principles. McDonald&apos;s golden arches are instantly recognizable from any distance, using a simple geometric shape and a single color. This proves that simplicity and boldness create memorability.</p>
              <p style={{ marginBottom: '16px' }}>Premium restaurant brands like Nobu use refined typography without imagery, letting the name itself become the visual identity. Indian restaurants like Bukhara use traditional motifs subtly incorporated into their wordmarks, creating cultural connection without being overly literal.</p>
              <p style={{ marginBottom: '16px' }}>Fast-casual chains like Chipotle and Sweetgreen use clean, modern designs that communicate freshness and quality. Their logos avoid cliched fast food imagery, instead opting for custom typography and subtle brand colors.</p>
              <p>Local restaurants can learn from these examples by focusing on what makes their brand unique. The key is authenticity — your logo should honestly reflect what guests experience when they walk through your doors.</p>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Branding Your Restaurant</h2>
            <div style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>A logo is just one element of your complete restaurant brand identity. Effective branding encompasses your color palette, typography system, photography style, tone of voice, interior design, staff uniforms, menu design, packaging, and digital presence.</p>
              <p style={{ marginBottom: '16px' }}>Start by defining your brand personality. Are you playful or serious? Traditional or innovative? Affordable or premium? These decisions guide every visual and verbal choice you make.</p>
              <p style={{ marginBottom: '16px' }}>Consistency is the key to strong branding. Every time a customer interacts with your restaurant — through a delivery app, Instagram post, takeaway bag, or the physical space — they should immediately recognize your brand.</p>
              <p>Digital branding is especially critical today. Your Google Business profile, social media, delivery app listings, and website must all present a unified brand image. Restaurants with strong, consistent branding across platforms see up to 23% higher revenue.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', color: '#111827', textAlign: 'left', gap: '16px' }}
                  >
                    <span style={{ flex: 1 }}>{faq.q}</span>
                    <span style={{ color: '#6366f1', flexShrink: 0, fontSize: '14px' }}>
                      {openFaq === idx ? '\u25B2' : '\u25BC'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px', fontSize: '15px', color: '#4b5563', lineHeight: 1.7, borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', padding: '64px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Build a Complete Restaurant Brand</h2>
            <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '28px', lineHeight: 1.6 }}>
              DineOpen POS includes built-in branding features — custom receipts with your logo, branded digital menus, and consistent visual identity across all customer touchpoints.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#6366f1', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>
                Start Free Trial
              </Link>
              <Link href="/demo" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', fontWeight: '600', fontSize: '16px', textDecoration: 'none' }}>
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '28px' }}>
              Related Free Tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { href: '/tools/restaurant-name-generator', label: 'Restaurant Name Generator', desc: 'Find the perfect name' },
                { href: '/tools/tagline-generator', label: 'Tagline Generator', desc: 'Create a memorable slogan' },
                { href: '/tools/menu-card-maker', label: 'Menu Card Maker', desc: 'Design your menu' },
                { href: '/tools/social-caption-generator', label: 'Social Caption Generator', desc: 'AI captions for posts' },
              ].map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  style={{ display: 'block', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)')}
                >
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{tool.label}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{tool.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <InternalLinks currentPath="/tools/logo-maker" variant="tool" />
        <Footer />
      </div>
    </>
  );
}
