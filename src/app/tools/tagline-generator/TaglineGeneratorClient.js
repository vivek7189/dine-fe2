'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function TaglineGeneratorClient() {
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('indian');
  const [vibe, setVibe] = useState('warm');
  const [usp, setUsp] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTaglines, setGeneratedTaglines] = useState([]);
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const MAX_API_CALLS = 10;

  useEffect(() => {
    const loginStatus = localStorage.getItem('dineopen_logged_in');
    const calls = localStorage.getItem('dineopen_tagline_gen_calls');
    setIsLoggedIn(loginStatus === 'true');
    setApiCallsUsed(parseInt(calls) || 0);
  }, []);

  const vibeOptions = [
    { value: 'warm', label: 'Warm & Welcoming' },
    { value: 'premium', label: 'Premium & Elegant' },
    { value: 'fun', label: 'Fun & Quirky' },
    { value: 'authentic', label: 'Authentic & Traditional' },
    { value: 'modern', label: 'Modern & Trendy' },
    { value: 'family', label: 'Family-Oriented' },
  ];

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (apiCallsUsed >= MAX_API_CALLS) {
      alert('You have reached the limit of 10 free generations. Please upgrade to continue.');
      return;
    }

    setIsGenerating(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const taglines = generateMockTaglines();
      setGeneratedTaglines(taglines);

      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('dineopen_tagline_gen_calls', newCount.toString());
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTaglines = () => {
    const taglinesByVibe = {
      warm: [
        'Where every meal feels like home',
        'Taste the warmth in every bite',
        'Good food, great company',
        'Made with love, served with care',
        'Your table is always ready',
        'Comfort food for the soul',
      ],
      premium: [
        'Elevating dining to an art',
        'Where excellence is served',
        'A symphony of flavors',
        'Crafted for the discerning palate',
        'Luxury on your plate',
        'Fine dining, redefined',
      ],
      fun: [
        'Life is short, eat dessert first!',
        'Fork yeah, this is good!',
        'Where food meets fun',
        'Eat, laugh, repeat',
        'Serious about not being serious',
        'Food that makes you smile',
      ],
      authentic: [
        'Recipes passed down, flavors that last',
        'True to tradition, true to taste',
        'Heritage on a plate',
        'The real deal since day one',
        'Authenticity you can taste',
        'Old recipes, timeless flavors',
      ],
      modern: [
        'Classic flavors, modern twist',
        'Innovation meets tradition',
        'Fresh takes on favorites',
        'Redefining taste, one plate at a time',
        'Where creativity meets cuisine',
        'The future of flavor',
      ],
      family: [
        'Where families come together',
        'Creating memories, one meal at a time',
        'Your family dining destination',
        'Good food brings us together',
        'From our family to yours',
        'Where every guest is family',
      ],
    };

    return (taglinesByVibe[vibe] || taglinesByVibe.warm).map(tagline => ({
      tagline,
      category: vibe,
    }));
  };

  const handleLogin = () => {
    window.location.href = 'https://app.dineopen.com/login?redirect=' + encodeURIComponent(window.location.href);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              ✨ AI-Powered
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
                    Restaurant Name
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
                  {isGenerating ? 'Generating...' : '✨ Generate Taglines'}
                </button>

                {isLoggedIn && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {MAX_API_CALLS - apiCallsUsed} free generations remaining
                  </p>
                )}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Taglines</h3>

                {generatedTaglines.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {generatedTaglines.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(item.tagline)}
                        style={{
                          padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px',
                          backgroundColor: '#fff7ed', cursor: 'pointer', transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', fontStyle: 'italic' }}>
                          &ldquo;{item.tagline}&rdquo;
                        </p>
                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>Click to copy</p>
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
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</p>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Login Required</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Create a free account to generate AI-powered taglines. You get 10 free generations!
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#f97316', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', marginBottom: '12px'
              }}
            >
              Login / Sign Up Free
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b7280',
                border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
