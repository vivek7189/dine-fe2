'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

export default function TaglineGeneratorClient() {
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('indian');
  const [vibe, setVibe] = useState('warm');
  const [usp, setUsp] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { generate, isGenerating, error, remaining } = useAITool('tagline');

  const vibeOptions = [
    { value: 'warm', label: 'Warm & Welcoming' },
    { value: 'premium', label: 'Premium & Elegant' },
    { value: 'fun', label: 'Fun & Quirky' },
    { value: 'authentic', label: 'Authentic & Traditional' },
    { value: 'modern', label: 'Modern & Trendy' },
    { value: 'family', label: 'Family-Oriented' },
  ];

  const handleGenerate = async () => {
    if (!restaurantName.trim()) {
      alert('Please enter your restaurant name');
      return;
    }

    const result = await generate({
      restaurantName,
      cuisine,
      vibe: vibeOptions.find(v => v.value === vibe)?.label || vibe,
      keywords: usp || undefined,
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

  // Parse numbered list from AI response into individual taglines
  const taglines = generatedText
    ? generatedText.split('\n').filter(line => line.trim().length > 0)
    : [];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Tagline Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create catchy, memorable taglines for your restaurant brand
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Brand Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g., Spice Garden"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Cuisine Type
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="indian">Indian</option>
                    <option value="chinese">Chinese/Asian</option>
                    <option value="italian">Italian</option>
                    <option value="continental">Continental</option>
                    <option value="cafe">Cafe</option>
                    <option value="fusion">Multi-Cuisine</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Brand Vibe
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {vibeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setVibe(opt.value)}
                        style={{
                          padding: '10px',
                          backgroundColor: vibe === opt.value ? '#f97316' : '#f3f4f6',
                          color: vibe === opt.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Unique Selling Point (Optional)
                  </label>
                  <input
                    type="text"
                    value={usp}
                    onChange={(e) => setUsp(e.target.value)}
                    placeholder="e.g., Farm-to-table, 50 years old recipes"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Taglines'}
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
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Taglines</h3>

                {taglines.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {taglines.map((line, i) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(line.replace(/^\d+[\.\)]\s*/, ''), i)}
                        style={{
                          padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px',
                          backgroundColor: '#fff7ed', cursor: 'pointer', transition: 'transform 0.2s'
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
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
                    <p>Fill in your brand details and click Generate for AI-powered tagline suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f97316', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Build Your Restaurant Brand</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>From name to menu to operations - DineOpen has you covered.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#f97316', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/tagline-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
