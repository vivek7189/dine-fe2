'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

const cuisineOptions = [
  { value: 'indian', label: 'Indian', emoji: '🍛' },
  { value: 'chinese', label: 'Chinese', emoji: '🥡' },
  { value: 'italian', label: 'Italian', emoji: '🍝' },
  { value: 'mexican', label: 'Mexican', emoji: '🌮' },
  { value: 'japanese', label: 'Japanese', emoji: '🍣' },
  { value: 'thai', label: 'Thai', emoji: '🍜' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { value: 'american', label: 'American', emoji: '🍔' },
  { value: 'french', label: 'French', emoji: '🥐' },
  { value: 'korean', label: 'Korean', emoji: '🥘' },
  { value: 'middle-eastern', label: 'Middle Eastern', emoji: '🧆' },
  { value: 'african', label: 'African', emoji: '🍲' },
  { value: 'cafe', label: 'Cafe / Coffee', emoji: '☕' },
  { value: 'fusion', label: 'Fusion', emoji: '🔥' },
  { value: 'streetfood', label: 'Street Food', emoji: '🌯' },
  { value: 'bakery', label: 'Bakery / Desserts', emoji: '🧁' },
  { value: 'seafood', label: 'Seafood', emoji: '🦐' },
  { value: 'caribbean', label: 'Caribbean', emoji: '🥥' },
];

const themeOptions = [
  { value: 'casual', label: 'Casual Dining', icon: '🪑' },
  { value: 'finedining', label: 'Fine Dining', icon: '🍷' },
  { value: 'familyfriendly', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'trendy', label: 'Trendy / Hip', icon: '✨' },
  { value: 'traditional', label: 'Traditional', icon: '🏛️' },
  { value: 'quick', label: 'QSR / Fast', icon: '⚡' },
  { value: 'foodtruck', label: 'Food Truck', icon: '🚚' },
  { value: 'cloudkitchen', label: 'Cloud Kitchen', icon: '☁️' },
];

const styleOptions = [
  { value: 'creative', label: 'Creative & Unique' },
  { value: 'classic', label: 'Classic & Professional' },
  { value: 'fun', label: 'Fun & Playful' },
  { value: 'elegant', label: 'Elegant & Sophisticated' },
];

export default function RestaurantNameClient() {
  const [cuisine, setCuisine] = useState('indian');
  const [theme, setTheme] = useState('casual');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [style, setStyle] = useState('creative');
  const [generatedText, setGeneratedText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('restaurant-name');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleGenerate = async () => {
    const cuisineLabel = cuisineOptions.find(c => c.value === cuisine)?.label || cuisine;
    const vibeLabel = themeOptions.find(t => t.value === theme)?.label || theme;

    const result = await generate({
      cuisine: cuisineLabel,
      vibe: `${vibeLabel}, ${styleOptions.find(s => s.value === style)?.label || style}`,
      location: location || 'Global',
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

  // Parse AI response into structured name entries
  const parsedNames = generatedText
    ? generatedText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Remove leading number like "1. " or "1) "
          const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
          // Split on " — " or " - " to separate name from explanation
          const dashMatch = cleaned.match(/^(.+?)\s[—–-]\s(.+)$/);
          if (dashMatch) {
            return { name: dashMatch[1].trim(), desc: dashMatch[2].trim() };
          }
          // If no dash, try colon
          const colonMatch = cleaned.match(/^(.+?):\s(.+)$/);
          if (colonMatch && colonMatch[1].length < 40) {
            return { name: colonMatch[1].trim(), desc: colonMatch[2].trim() };
          }
          return { name: cleaned, desc: '' };
        })
    : [];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#faf5ff', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
          color: 'white',
          padding: isMobile ? '48px 20px' : '72px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          }} />
          <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px', fontSize: '13px', marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              AI-Powered &bull; 100% Free &bull; No Sign-up
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '800', marginBottom: '16px', lineHeight: 1.15 }}>
              Restaurant Name Generator
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.92, maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
              Generate unique, creative restaurant name ideas for any cuisine, anywhere in the world
            </p>
          </div>
        </section>

        {/* Generator Section */}
        <section style={{ padding: isMobile ? '40px 16px' : '60px 20px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: isMobile ? '24px 16px' : '40px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
              border: '1px solid #f3e8ff',
            }}>
              {/* Cuisine */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '14px' }}>
                  What cuisine will you serve?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {cuisineOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCuisine(opt.value)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: cuisine === opt.value ? '#7c3aed' : '#faf5ff',
                        color: cuisine === opt.value ? 'white' : '#4b5563',
                        border: cuisine === opt.value ? '2px solid #7c3aed' : '2px solid #e9d5ff',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '14px' }}>
                  What type of restaurant?
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: '10px',
                }}>
                  {themeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      style={{
                        padding: '14px 12px',
                        backgroundColor: theme === opt.value ? '#f5f3ff' : '#fafafa',
                        color: theme === opt.value ? '#7c3aed' : '#4b5563',
                        border: theme === opt.value ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.15s',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{opt.icon}</div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '14px' }}>
                  Naming style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
                  {styleOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStyle(opt.value)}
                      style={{
                        padding: '12px',
                        backgroundColor: style === opt.value ? '#7c3aed' : '#f9fafb',
                        color: style === opt.value ? 'white' : '#4b5563',
                        border: style === opt.value ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords + Location */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '16px',
                marginBottom: '32px',
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Keywords <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., heritage, rooftop, organic"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: '2px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#c4b5fd'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Location <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., New York, London, Mumbai"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: '2px solid #e5e7eb', borderRadius: '10px',
                      fontSize: '14px', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#c4b5fd'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '16px',
                  background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '17px',
                  boxShadow: isGenerating ? 'none' : '0 4px 20px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {isGenerating ? '✨ Generating Names...' : '✨ Generate Restaurant Names'}
              </button>

              {remaining !== null && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                  {remaining} free generations remaining today
                </p>
              )}
              {error && (
                <p style={{
                  textAlign: 'center', marginTop: '12px', fontSize: '14px',
                  color: '#dc2626', backgroundColor: '#fef2f2',
                  padding: '12px', borderRadius: '10px',
                }}>
                  {error}
                </p>
              )}
            </div>

            {/* Results */}
            {parsedNames.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h2 style={{
                  fontSize: '24px', fontWeight: '800', color: '#1f2937',
                  marginBottom: '20px', textAlign: 'center',
                }}>
                  Your Restaurant Name Ideas
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '16px',
                }}>
                  {parsedNames.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '14px',
                        padding: '20px 24px',
                        border: '1px solid #f3e8ff',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onClick={() => copyToClipboard(item.name, i)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.12)';
                        e.currentTarget.style.borderColor = '#c4b5fd';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                        e.currentTarget.style.borderColor = '#f3e8ff';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '18px', fontWeight: '700', color: '#111827',
                          marginBottom: item.desc ? '6px' : '0',
                        }}>
                          {item.name}
                        </p>
                        {item.desc && (
                          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(item.name, i); }}
                        style={{
                          flexShrink: 0,
                          padding: '8px 14px',
                          backgroundColor: copiedIdx === i ? '#7c3aed' : '#f5f3ff',
                          color: copiedIdx === i ? 'white' : '#7c3aed',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {copiedIdx === i ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {parsedNames.length === 0 && !isGenerating && (
              <div style={{
                marginTop: '40px', textAlign: 'center', padding: '60px 20px',
                backgroundColor: 'white', borderRadius: '20px',
                border: '2px dashed #e9d5ff',
              }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</p>
                <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
                  Choose your cuisine & style, then hit Generate
                </p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  AI will create 10 unique restaurant name ideas for you
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '32px',
            }}>
              {[
                { step: '1', emoji: '🎯', title: 'Choose Your Style', desc: 'Select your cuisine type, restaurant theme, and naming style from our options' },
                { step: '2', emoji: '🤖', title: 'AI Generates Names', desc: 'Our AI creates 10 unique, brandable restaurant name ideas tailored to your choices' },
                { step: '3', emoji: '📋', title: 'Copy & Build', desc: 'Pick your favorite name, copy it with one click, and start building your brand' },
              ].map((item) => (
                <div key={item.step} style={{ padding: '24px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: '28px',
                  }}>
                    {item.emoji}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Naming Tips */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: '#faf5ff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Tips for Choosing the Perfect Restaurant Name
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              A great name is the foundation of your restaurant brand. Keep these tips in mind:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
            }}>
              {[
                { title: 'Keep it short', desc: 'The best restaurant names are 2-3 words max. Short names are easier to remember, fit on signage, and work as domain names.' },
                { title: 'Make it easy to spell & pronounce', desc: 'If customers can\'t spell it, they won\'t search for it online. Avoid complex spellings that hurt word-of-mouth.' },
                { title: 'Check domain & social availability', desc: 'Before finalizing, check if the .com domain and Instagram/Facebook handles are available for your chosen name.' },
                { title: 'Avoid names too similar to competitors', desc: 'Search Google and food delivery apps to make sure your name stands out and doesn\'t cause confusion with existing restaurants.' },
                { title: 'Think about your target audience', desc: 'A family restaurant and a cocktail bar need different vibes. Your name should give customers a feel for the dining experience.' },
                { title: 'Consider future growth', desc: 'Avoid overly specific names (like "Mumbai Biryani Hut") if you plan to expand your menu or open in other cities.' },
              ].map((tip, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '14px',
                    padding: '24px',
                    border: '1px solid #f3e8ff',
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                    {tip.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          padding: isMobile ? '48px 16px' : '72px 20px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)',
          color: 'white', textAlign: 'center',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Open Your Restaurant?
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.92, marginBottom: '24px', lineHeight: 1.6 }}>
              DineOpen helps you manage everything from POS to orders, menus, inventory, and more — from day one.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/resources/startup-guide" style={{
                display: 'inline-block', padding: '14px 32px',
                backgroundColor: 'white', color: '#7c3aed',
                borderRadius: '10px', fontWeight: '700', textDecoration: 'none',
                fontSize: '15px',
              }}>
                Read Startup Guide
              </Link>
              <Link href="/pricing" style={{
                display: 'inline-block', padding: '14px 32px',
                backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
                borderRadius: '10px', fontWeight: '700', textDecoration: 'none',
                fontSize: '15px', border: '1px solid rgba(255,255,255,0.3)',
              }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <InternalLinks currentPath="/tools/restaurant-name-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
