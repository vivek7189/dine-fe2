'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function ComplaintResponseClient() {
  const [complaintType, setComplaintType] = useState('food');
  const [complaint, setComplaint] = useState('');
  const [tone, setTone] = useState('apologetic');
  const [offerCompensation, setOfferCompensation] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const MAX_API_CALLS = 10;

  useEffect(() => {
    const loginStatus = localStorage.getItem('dineopen_logged_in');
    const calls = localStorage.getItem('dineopen_complaint_gen_calls');
    setIsLoggedIn(loginStatus === 'true');
    setApiCallsUsed(parseInt(calls) || 0);
  }, []);

  const complaintTypes = [
    { value: 'food', label: 'Food Quality Issue' },
    { value: 'service', label: 'Poor Service' },
    { value: 'delay', label: 'Long Wait / Delay' },
    { value: 'wrong', label: 'Wrong Order' },
    { value: 'hygiene', label: 'Hygiene Concern' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'delivery', label: 'Delivery Problem' },
  ];

  const tones = [
    { value: 'apologetic', label: 'Apologetic' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
  ];

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (apiCallsUsed >= MAX_API_CALLS) {
      alert('You have reached the limit of 10 free generations.');
      return;
    }

    if (!complaint.trim()) {
      alert('Please describe the complaint first.');
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = generateMockResponse();
      setGeneratedResponse(response);

      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('dineopen_complaint_gen_calls', newCount.toString());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockResponse = () => {
    const greetings = {
      apologetic: 'We sincerely apologize for',
      empathetic: 'We completely understand your frustration regarding',
      professional: 'Thank you for bringing to our attention',
      friendly: 'We really appreciate you reaching out about',
    };

    const typeResponses = {
      food: `${greetings[tone]} the issue with your food. This is not the experience we want for our guests. Our kitchen team takes food quality very seriously, and we will immediately look into what went wrong.`,
      service: `${greetings[tone]} the service you received. We pride ourselves on providing excellent hospitality, and clearly we fell short this time. We will address this with our team right away.`,
      delay: `${greetings[tone]} the delay in your order. We understand how frustrating it is to wait longer than expected, especially when you're hungry. We're working on improving our kitchen efficiency.`,
      wrong: `${greetings[tone]} receiving the wrong order. This should not have happened, and we take full responsibility for this mix-up.`,
      hygiene: `${greetings[tone]} your hygiene concern. Cleanliness is our top priority, and we take such feedback extremely seriously. We will immediately investigate and take corrective action.`,
      billing: `${greetings[tone]} the billing discrepancy. We completely understand how concerning this must be. Our team will review your bill immediately and ensure any errors are corrected.`,
      delivery: `${greetings[tone]} the delivery issue. We understand how disappointing it is when your food doesn't arrive as expected.`,
    };

    let response = typeResponses[complaintType];

    if (offerCompensation) {
      response += `\n\nTo make it up to you, we would like to offer you a complimentary meal / discount on your next visit. Please reach out to us directly so we can arrange this for you.`;
    }

    response += `\n\nYour feedback helps us improve, and we truly value your patronage. We hope you'll give us another chance to serve you better.\n\nWarm regards,\n[Your Restaurant Name]`;

    return response;
  };

  const handleLogin = () => {
    window.location.href = 'https://app.dineopen.com/login?redirect=' + encodeURIComponent(window.location.href);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResponse);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              ✨ AI-Powered
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Complaint Response Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Generate professional responses to customer complaints and negative feedback
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Complaint Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Complaint Type
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {complaintTypes.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Customer Complaint / Review
                  </label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Paste the customer complaint or describe the issue..."
                    rows={4}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Response Tone
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tones.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: tone === t.value ? '#dc2626' : '#f3f4f6',
                          color: tone === t.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={offerCompensation} onChange={(e) => setOfferCompensation(e.target.checked)} />
                    <span style={{ fontSize: '14px' }}>Include compensation offer</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : '✨ Generate Response'}
                </button>

                {isLoggedIn && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {MAX_API_CALLS - apiCallsUsed} free generations remaining
                  </p>
                )}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Generated Response</h3>
                  {generatedResponse && (
                    <button
                      onClick={copyToClipboard}
                      style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Copy
                    </button>
                  )}
                </div>

                {generatedResponse ? (
                  <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                      {generatedResponse}
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
                    <p>Describe the complaint and click Generate for a professional response</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Tips for Handling Complaints</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Respond Quickly</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Reply within 24 hours to show you care</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Never Argue</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Acknowledge their feelings, do not defend</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Offer Solution</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Give them a reason to come back</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>Take Offline</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Move to DM/email for detailed discussions</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#dc2626', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Turn Complaints into Loyalty</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps you track customer feedback and respond faster.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
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
              Create a free account to generate responses. You get 10 free generations!
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#dc2626', color: 'white',
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
