'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function RestaurantNameClient() {
  const [cuisine, setCuisine] = useState('indian');
  const [theme, setTheme] = useState('casual');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [style, setStyle] = useState('creative');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const MAX_API_CALLS = 10;

  useEffect(() => {
    // Check login status and API usage from localStorage
    const loginStatus = localStorage.getItem('dineopen_logged_in');
    const calls = localStorage.getItem('dineopen_name_gen_calls');
    setIsLoggedIn(loginStatus === 'true');
    setApiCallsUsed(parseInt(calls) || 0);
  }, []);

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
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/generate-names', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cuisine, theme, keywords, location, style })
      // });
      // const data = await response.json();

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockNames = generateMockNames();
      setGeneratedNames(mockNames);

      // Update API call count
      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('dineopen_name_gen_calls', newCount.toString());
    } catch (error) {
      console.error('Error generating names:', error);
      alert('Failed to generate names. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockNames = () => {
    // This would be replaced by actual AI response
    const cuisineMap = {
      indian: ['Spice Route', 'Masala Magic', 'Curry House', 'Tandoor Tales', 'Desi Delights', 'Namaste Kitchen', 'Saffron Stories', 'Mirchi & More'],
      chinese: ['Wok & Roll', 'Dragon Bowl', 'Noodle Nirvana', 'Bamboo Bites', 'Dynasty Diner', 'Golden Chopsticks', 'Dim Sum Dreams', 'Rice Republic'],
      italian: ['Pasta Prima', 'La Cucina', 'Olive & Oak', 'Trattoria Bella', 'Piazza Kitchen', 'Tuscan Table', 'Basilico', 'Il Forno'],
      cafe: ['Brew & Bites', 'The Daily Grind', 'Caffeine Culture', 'Bean There', 'Cozy Corner Cafe', 'The Coffee Canvas', 'Morning Mood', 'Cuppa Joy'],
      fusion: ['East Meets West', 'Flavor Fusion', 'Cross Culture Kitchen', 'The Blend', 'Twisted Classics', 'Global Grill', 'Mix & Match', 'Border Crossings'],
      mexican: ['Taco Tales', 'Salsa Studio', 'Fiesta Kitchen', 'Casa de Sabor', 'Burrito Brothers', 'Guac & Roll', 'Cantina Corner', 'Aztec Bites'],
      continental: ['The Continental', 'European Table', 'Classic Kitchen', 'The Grill Room', 'Savory & Sweet', 'The Brasserie', 'Continental Corner', 'Prime & Proper'],
      streetfood: ['Street Eats', 'Chaat Corner', 'The Food Cart', 'Urban Bites', 'Gully Kitchen', 'Thela Tales', 'Street Side Story', 'Hawker House'],
    };

    const names = cuisineMap[cuisine] || cuisineMap.indian;
    const shuffled = names.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 6).map((name, i) => ({
      name: keywords ? `${name} ${keywords.split(' ')[0] || ''}`.trim() : name,
      tagline: getRandomTagline(cuisine),
      available: Math.random() > 0.3,
    }));
  };

  const getRandomTagline = (cuisine) => {
    const taglines = [
      'Where flavor meets passion',
      'Taste the tradition',
      'Every bite tells a story',
      'Crafted with love',
      'Your culinary destination',
      'Flavors that inspire',
    ];
    return taglines[Math.floor(Math.random() * taglines.length)];
  };

  const handleLogin = () => {
    // Redirect to login
    window.location.href = 'https://app.dineopen.com/login?redirect=' + encodeURIComponent(window.location.href);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              ✨ AI-Powered
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
                  {isGenerating ? 'Generating...' : '✨ Generate Names'}
                </button>

                {isLoggedIn && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {MAX_API_CALLS - apiCallsUsed} free generations remaining
                  </p>
                )}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Names</h3>

                {generatedNames.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {generatedNames.map((item, i) => (
                      <div key={i} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fdf2f8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{item.name}</p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{item.tagline}</p>
                          </div>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                            backgroundColor: item.available ? '#dcfce7' : '#fee2e2',
                            color: item.available ? '#166534' : '#991b1b'
                          }}>
                            {item.available ? 'Available' : 'Taken'}
                          </span>
                        </div>
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
              Create a free account to generate AI-powered restaurant names. You get 10 free generations!
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#ec4899', color: 'white',
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
