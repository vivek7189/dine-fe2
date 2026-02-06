'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaMagic, FaCopy, FaStar, FaLock, FaCheckCircle, FaGoogle, FaUtensils } from 'react-icons/fa';

export default function ReviewResponseGeneratorClient() {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(3);
  const [reviewerName, setReviewerName] = useState('');
  const [platform, setPlatform] = useState('google');
  const [tone, setTone] = useState('professional');
  const [restaurantName, setRestaurantName] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [copied, setCopied] = useState(false);

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

    // Check if user is logged in
    const isLoggedIn = false; // Replace with actual auth check

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    generateResponse();
  };

  const generateResponse = async () => {
    setIsGenerating(true);
    setGeneratedResponse('');

    // Simulate API call
    setTimeout(() => {
      const response = generateMockResponse();
      setGeneratedResponse(response);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMockResponse = () => {
    const name = reviewerName || 'Valued Guest';
    const restaurant = restaurantName || 'our restaurant';
    const isPositive = reviewRating >= 4;
    const isNegative = reviewRating <= 2;

    if (isPositive) {
      const positiveResponses = {
        professional: `Dear ${name},\n\nThank you for taking the time to share your experience at ${restaurant}. We are delighted to hear that you enjoyed your visit with us.\n\nYour kind words mean a lot to our entire team, and we are committed to maintaining the standards that made your experience memorable.\n\nWe look forward to welcoming you back soon.\n\nWarm regards,\nTeam ${restaurant}`,
        warm: `Hi ${name}! 😊\n\nWow, thank you so much for this wonderful review! It truly made our day.\n\nWe're thrilled that you had a great time at ${restaurant}. Reviews like yours remind us why we love what we do!\n\nCan't wait to see you again soon. Until then, take care!\n\nWith gratitude,\nThe ${restaurant} Family`,
        apologetic: `Dear ${name},\n\nThank you so much for your kind review of ${restaurant}. We're genuinely happy to know you enjoyed your experience.\n\nIf there's anything we could have done even better, please don't hesitate to let us know. We're always looking to improve!\n\nHope to see you again soon.\n\nBest wishes,\nTeam ${restaurant}`,
        enthusiastic: `${name}!! 🎉\n\nTHANK YOU for this amazing review! We're absolutely thrilled!\n\nKnowing that you loved your experience at ${restaurant} makes all our hard work worth it. You've seriously made everyone here smile!\n\nWe can't wait to have you back - maybe we'll surprise you with something special! 😉\n\nCheers,\nYour friends at ${restaurant}`,
      };
      return positiveResponses[tone];
    } else if (isNegative) {
      const negativeResponses = {
        professional: `Dear ${name},\n\nThank you for bringing this to our attention. We sincerely apologize that your experience at ${restaurant} did not meet our usual standards.\n\nWe take all feedback seriously, and we have shared your concerns with our team to ensure this doesn't happen again.\n\nWe would like the opportunity to make this right. Please contact us at your convenience so we can discuss how to improve your experience.\n\nSincerely,\nManagement, ${restaurant}`,
        warm: `Hi ${name},\n\nFirst, thank you for being honest with us. We're truly sorry that we let you down during your visit to ${restaurant}.\n\nThis isn't the experience we want for any of our guests, and your feedback helps us do better. We've already discussed your concerns with our team.\n\nWe'd love a chance to make it up to you. Would you give us another opportunity? Please reach out - we want to turn this around.\n\nWith sincere apologies,\nTeam ${restaurant}`,
        apologetic: `Dear ${name},\n\nWe are deeply sorry for the disappointing experience you had at ${restaurant}. Please accept our sincere apologies.\n\nThere is no excuse for what happened, and we fully understand your frustration. We have taken immediate steps to address the issues you mentioned.\n\nYour feedback is invaluable to us. If you're willing, we would be honored to have you back as our guest, complimentary, to show you the experience we truly strive to provide.\n\nWith our deepest apologies,\n${restaurant} Management`,
        enthusiastic: `Hey ${name},\n\nOh no! We're really sorry to hear about your experience. This definitely isn't the ${restaurant} we know and love!\n\nWe've taken your feedback to heart and are working to fix things ASAP. Your visit matters to us - a lot!\n\nPlease give us another shot? We promise to make it right. Drop us a message, and let's figure this out together!\n\nReally hoping to see you again,\n${restaurant} Team`,
      };
      return negativeResponses[tone];
    } else {
      // Neutral response for 3-star reviews
      return `Dear ${name},\n\nThank you for dining at ${restaurant} and for taking the time to share your feedback.\n\nWe're glad you had an okay experience, but we'd love to make your next visit exceptional! Your feedback helps us identify areas where we can improve.\n\nPlease let us know what we could do better next time. We're always striving to exceed expectations.\n\nLooking forward to serving you again,\nTeam ${restaurant}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoginAndGenerate = () => {
    window.location.href = `https://app.dineopen.com/login?returnUrl=${encodeURIComponent(window.location.href)}&action=review-generator`;
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '16px', fontSize: '14px' }}>
              <FaMagic /> AI-Powered
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

              {/* Login Prompt Modal */}
              {showLoginPrompt && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000, padding: '20px'
                }}>
                  <div style={{
                    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
                    maxWidth: '400px', width: '100%', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                      <FaLock style={{ color: '#2563eb', fontSize: '24px' }} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>
                      Free Account Required
                    </h3>
                    <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px' }}>
                      Sign up for free to generate AI review responses. Takes only 30 seconds!
                    </p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <button
                        onClick={handleLoginAndGenerate}
                        style={{
                          padding: '14px', backgroundColor: '#2563eb', color: 'white',
                          border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        Sign Up Free
                      </button>
                      <button
                        onClick={() => setShowLoginPrompt(false)}
                        style={{
                          padding: '14px', backgroundColor: '#f3f4f6', color: '#374151',
                          border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
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
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
