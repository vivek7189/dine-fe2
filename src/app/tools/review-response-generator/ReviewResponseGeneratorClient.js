'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';
import { FaMagic, FaCopy, FaStar, FaCheckCircle } from 'react-icons/fa';

export default function ReviewResponseGeneratorClient() {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(3);
  const [reviewerName, setReviewerName] = useState('');
  const [platform, setPlatform] = useState('google');
  const [tone, setTone] = useState('professional');
  const [restaurantName, setRestaurantName] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('review-response');

  const platforms = [
    { value: 'google', label: 'Google Reviews' },
    { value: 'zomato', label: 'Zomato' },
    { value: 'swiggy', label: 'Swiggy' },
    { value: 'tripadvisor', label: 'TripAdvisor' },
    { value: 'facebook', label: 'Facebook' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional', desc: 'Formal, business-like' },
    { value: 'warm', label: 'Warm & Friendly', desc: 'Personal, welcoming' },
    { value: 'apologetic', label: 'Apologetic', desc: 'For negative reviews' },
    { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic, grateful' },
  ];

  const handleGenerate = async () => {
    if (!reviewText.trim()) {
      alert('Please paste the review text');
      return;
    }

    const result = await generate({
      reviewText,
      rating: String(reviewRating),
      restaurantName: restaurantName || undefined,
      reviewerName: reviewerName || undefined,
      tone,
      platform,
    });

    if (result) {
      setGeneratedResponse(result);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '16px', fontSize: '14px' }}>
              <FaMagic /> AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Review Response Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Generate professional responses to customer reviews in seconds. Works for Google, Zomato, Swiggy & more.
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Review Text */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Paste the Review *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Paste the customer review here..."
                  rows={4}
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', resize: 'vertical' }}
                />
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Review Rating
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      style={{
                        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: reviewRating === rating ? '#2563eb' : '#f3f4f6',
                        color: reviewRating === rating ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                      }}
                    >
                      <FaStar style={{ color: reviewRating === rating ? 'white' : '#fbbf24' }} />
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Reviewer Name (optional)
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g., Rahul S."
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Your Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g., Spice Garden"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Platform & Tone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Review Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Response Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {tones.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '16px',
                  background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '18px', fontWeight: '700', cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {isGenerating ? <>Generating...</> : <><FaMagic /> Generate Response</>}
              </button>

              {/* Remaining / Error */}
              {remaining !== null && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                  {remaining} free generations remaining today
                </p>
              )}
              {error && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                  {error}
                </p>
              )}

              {/* Generated Response */}
              {generatedResponse && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>
                    Your Response
                  </h3>
                  <div style={{
                    padding: '24px', backgroundColor: '#eff6ff', borderRadius: '12px',
                    border: '1px solid #bfdbfe', whiteSpace: 'pre-wrap'
                  }}>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
                      {generatedResponse}
                    </p>
                    <button
                      onClick={handleCopy}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 20px', backgroundColor: copied ? '#059669' : '#2563eb',
                        color: 'white', border: 'none', borderRadius: '6px',
                        fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                      }}
                    >
                      {copied ? <><FaCheckCircle /> Copied!</> : <><FaCopy /> Copy Response</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#2563eb', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage All Reviews in One Place</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen brings all your reviews from Zomato, Google, and Swiggy into one dashboard.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/review-response-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
