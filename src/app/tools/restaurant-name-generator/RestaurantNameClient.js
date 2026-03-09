'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

export default function RestaurantNameClient() {
  const [cuisine, setCuisine] = useState('indian');
  const [theme, setTheme] = useState('casual');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [style, setStyle] = useState('creative');
  const [generatedText, setGeneratedText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { generate, isGenerating, error, remaining } = useAITool('restaurant-name');

  const cuisineOptions = [
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese/Asian' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'continental', label: 'Continental' },
    { value: 'cafe', label: 'Cafe/Coffee' },
    { value: 'fusion', label: 'Fusion' },
    { value: 'streetfood', label: 'Street Food' },
  ];

  const themeOptions = [
    { value: 'casual', label: 'Casual Dining' },
    { value: 'finedining', label: 'Fine Dining' },
    { value: 'familyfriendly', label: 'Family Friendly' },
    { value: 'trendy', label: 'Trendy/Hip' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'quick', label: 'Quick Service' },
  ];

  const styleOptions = [
    { value: 'creative', label: 'Creative & Unique' },
    { value: 'classic', label: 'Classic & Professional' },
    { value: 'fun', label: 'Fun & Playful' },
    { value: 'elegant', label: 'Elegant & Sophisticated' },
  ];

  const handleGenerate = async () => {
    const cuisineLabel = cuisineOptions.find(c => c.value === cuisine)?.label || cuisine;
    const vibeLabel = themeOptions.find(t => t.value === theme)?.label || theme;

    const result = await generate({
      cuisine: cuisineLabel,
      vibe: `${vibeLabel}, ${styleOptions.find(s => s.value === style)?.label || style}`,
      location: location || 'India',
      keywords: keywords || undefined,
    });

    if (result) {
      setGeneratedText(result);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Parse the AI response into name entries
  const names = generatedText
    ? generatedText.split('\n').filter(line => line.trim().length > 0)
    : [];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Name Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Get unique, creative restaurant name ideas powered by AI
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Tell us about your restaurant</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Cuisine Type
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {cuisineOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Restaurant Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {themeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Naming Style
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {styleOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStyle(opt.value)}
                        style={{
                          padding: '10px',
                          backgroundColor: style === opt.value ? '#ec4899' : '#f3f4f6',
                          color: style === opt.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., family, heritage, modern"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Delhi, Mumbai"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Names'}
                </button>

                {remaining !== null && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {remaining} free generations remaining today
                  </p>
                )}
                {error && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Names</h3>

                {names.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {names.map((line, i) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(line.replace(/^\d+[\.\)]\s*/, ''), i)}
                        style={{
                          padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px',
                          backgroundColor: '#fdf2f8', cursor: 'pointer', transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                          {line}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                          {copiedIdx === i ? 'Copied!' : 'Click to copy'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</p>
                    <p>Fill in the details and click Generate to get AI-powered name suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#ec4899', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Ready to Open Your Restaurant?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps you manage everything from day one.</p>
            <Link href="/resources/startup-guide" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ec4899', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Read Startup Guide
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/restaurant-name-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
