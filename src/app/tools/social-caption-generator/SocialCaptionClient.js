'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

export default function SocialCaptionClient() {
  const [postType, setPostType] = useState('food');
  const [dishName, setDishName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [restaurantName, setRestaurantName] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('social-caption');

  const postTypes = [
    { value: 'food', label: 'Food Photography' },
    { value: 'promo', label: 'Promotion/Offer' },
    { value: 'event', label: 'Event Announcement' },
    { value: 'behind', label: 'Behind the Scenes' },
    { value: 'team', label: 'Team/Staff' },
    { value: 'customer', label: 'Customer Love' },
  ];

  const platforms = ['Instagram', 'Facebook', 'Twitter'];

  const handleGenerate = async () => {
    const details = [dishName, occasion].filter(Boolean).join(', ');

    const result = await generate({
      postType: postTypes.find(p => p.value === postType)?.label || postType,
      details: details || undefined,
      platform,
      restaurantName: restaurantName || undefined,
    });

    if (result) {
      setGeneratedCaption(result);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Social Media Caption Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create engaging Instagram, Facebook & Twitter captions for your restaurant
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Post Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Post Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {postTypes.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPostType(opt.value)}
                        style={{
                          padding: '10px',
                          backgroundColor: postType === opt.value ? '#8b5cf6' : '#f3f4f6',
                          color: postType === opt.value ? 'white' : '#374151',
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
                    Restaurant Name (Optional)
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
                    Dish/Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Butter Chicken, Weekend Brunch"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Occasion (Optional)
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g., Diwali, Valentine's Day, Weekend"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Platform
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {platforms.map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        style={{
                          flex: 1, padding: '10px',
                          backgroundColor: platform === p ? '#8b5cf6' : '#f3f4f6',
                          color: platform === p ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Caption'}
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
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Caption</h3>

                {generatedCaption ? (
                  <div>
                    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f5f3ff' }}>
                      <p style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {generatedCaption}
                      </p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        marginTop: '16px', padding: '10px 20px', backgroundColor: copied ? '#059669' : '#8b5cf6', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy Caption'}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📱</p>
                    <p>Select post type and click Generate for AI-powered caption ideas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#8b5cf6', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Boost Your Restaurant Marketing</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps you engage customers through WhatsApp, SMS, and social media.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#8b5cf6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/social-caption-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
