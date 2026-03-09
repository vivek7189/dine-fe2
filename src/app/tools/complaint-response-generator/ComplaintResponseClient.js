'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

export default function ComplaintResponseClient() {
  const [complaint, setComplaint] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [channel, setChannel] = useState('Email');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('complaint-response');

  const channels = ['Email', 'Google Review', 'Zomato', 'Swiggy', 'Social Media', 'In-Person'];

  const handleGenerate = async () => {
    if (!complaint.trim()) {
      alert('Please describe the complaint first.');
      return;
    }

    const result = await generate({
      complaint,
      restaurantName: restaurantName || undefined,
      channel,
    });

    if (result) {
      setGeneratedResponse(result);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              AI-Powered &bull; Free, No Login
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
                    Customer Complaint / Review *
                  </label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Paste the customer complaint or describe the issue..."
                    rows={5}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                  />
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

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Channel
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {channels.map(ch => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: channel === ch ? '#dc2626' : '#f3f4f6',
                          color: channel === ch ? 'white' : '#374151',
                          border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
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
                  {isGenerating ? 'Generating...' : 'Generate Response'}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Generated Response</h3>
                  {generatedResponse && (
                    <button
                      onClick={copyToClipboard}
                      style={{ padding: '8px 16px', backgroundColor: copied ? '#059669' : '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
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
              {[
                { title: 'Respond Quickly', desc: 'Reply within 24 hours to show you care' },
                { title: 'Never Argue', desc: 'Acknowledge their feelings, do not defend' },
                { title: 'Offer Solution', desc: 'Give them a reason to come back' },
                { title: 'Take Offline', desc: 'Move to DM/email for detailed discussions' },
              ].map((tip, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{tip.desc}</p>
                </div>
              ))}
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

        <InternalLinks currentPath="/tools/complaint-response-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
