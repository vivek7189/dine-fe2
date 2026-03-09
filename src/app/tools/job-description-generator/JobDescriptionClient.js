'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';

export default function JobDescriptionClient() {
  const [role, setRole] = useState('Head Chef');
  const [experience, setExperience] = useState('2-5 years');
  const [restaurantType, setRestaurantType] = useState('casual');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [generatedJD, setGeneratedJD] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('job-description');

  const roles = [
    'Head Chef / Executive Chef',
    'Sous Chef',
    'Line Cook / Commis',
    'Waiter / Server',
    'Captain / Senior Waiter',
    'Restaurant Manager',
    'Bartender',
    'Host / Hostess',
    'Steward / Dishwasher',
    'Delivery Executive',
  ];

  const experienceLevels = [
    { value: '0-1 years', label: 'Entry Level' },
    { value: '2-5 years', label: 'Mid Level' },
    { value: '5+ years', label: 'Senior' },
  ];

  const handleGenerate = async () => {
    const requirements = [
      `Restaurant type: ${restaurantType}`,
      salary ? `Salary: ${salary}` : '',
    ].filter(Boolean).join('. ');

    const result = await generate({
      role,
      experience,
      restaurantName: undefined,
      location: location || undefined,
      requirements: requirements || undefined,
    });

    if (result) {
      setGeneratedJD(result);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Job Description Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create professional job descriptions for restaurant roles in seconds
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Job Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Position
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Experience Level
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {experienceLevels.map(e => (
                      <button
                        key={e.value}
                        onClick={() => setExperience(e.value)}
                        style={{
                          flex: 1, padding: '10px',
                          backgroundColor: experience === e.value ? '#0891b2' : '#f3f4f6',
                          color: experience === e.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Restaurant Type
                  </label>
                  <select
                    value={restaurantType}
                    onChange={(e) => setRestaurantType(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="casual">Casual Dining</option>
                    <option value="finedining">Fine Dining</option>
                    <option value="qsr">QSR / Fast Food</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar / Pub</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Mumbai, Bandra"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g., 25,000 - 35,000/month"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Job Description'}
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
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Generated JD</h3>
                  {generatedJD && (
                    <button
                      onClick={copyToClipboard}
                      style={{ padding: '8px 16px', backgroundColor: copied ? '#059669' : '#0891b2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {generatedJD ? (
                  <div style={{ padding: '20px', backgroundColor: '#f0fdfa', borderRadius: '12px', border: '1px solid #99f6e4' }}>
                    <pre style={{ fontSize: '13px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'inherit', margin: 0 }}>
                      {generatedJD}
                    </pre>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
                    <p>Select a role and click Generate for a professional job description</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#0891b2', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Your Restaurant Team</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen includes staff management, attendance tracking, and payroll.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/job-description-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
