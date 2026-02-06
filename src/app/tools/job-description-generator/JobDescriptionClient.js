'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function JobDescriptionClient() {
  const [role, setRole] = useState('chef');
  const [experience, setExperience] = useState('mid');
  const [restaurantType, setRestaurantType] = useState('casual');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJD, setGeneratedJD] = useState('');
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const MAX_API_CALLS = 10;

  useEffect(() => {
    const loginStatus = localStorage.getItem('dineopen_logged_in');
    const calls = localStorage.getItem('dineopen_jd_gen_calls');
    setIsLoggedIn(loginStatus === 'true');
    setApiCallsUsed(parseInt(calls) || 0);
  }, []);

  const roles = [
    { value: 'chef', label: 'Head Chef / Executive Chef' },
    { value: 'souschef', label: 'Sous Chef' },
    { value: 'linecook', label: 'Line Cook / Commis' },
    { value: 'waiter', label: 'Waiter / Server' },
    { value: 'captain', label: 'Captain / Senior Waiter' },
    { value: 'manager', label: 'Restaurant Manager' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'host', label: 'Host / Hostess' },
    { value: 'dishwasher', label: 'Steward / Dishwasher' },
    { value: 'delivery', label: 'Delivery Executive' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
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

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const jd = generateMockJD();
      setGeneratedJD(jd);

      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('dineopen_jd_gen_calls', newCount.toString());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockJD = () => {
    const roleData = roles.find(r => r.value === role);
    const expData = experienceLevels.find(e => e.value === experience);

    const templates = {
      chef: `**Position: ${roleData.label}**
${location ? `**Location:** ${location}` : ''}
${salary ? `**Salary:** ${salary}` : ''}
**Experience Required:** ${expData.label}

**About the Role:**
We are looking for a talented and passionate ${roleData.label} to lead our kitchen team. You will be responsible for menu development, kitchen operations, and ensuring the highest quality of food.

**Key Responsibilities:**
• Design and update menus based on seasonal availability and customer preferences
• Lead and mentor kitchen staff, ensuring smooth operations
• Maintain food quality standards and consistency across all dishes
• Manage food costs, inventory, and minimize wastage
• Ensure compliance with food safety and hygiene regulations (FSSAI)
• Collaborate with management on special events and catering

**Requirements:**
• ${expData.label} in a similar role
• Expertise in ${restaurantType === 'finedining' ? 'fine dining cuisine and plating techniques' : 'multi-cuisine cooking'}
• Strong leadership and team management skills
• Knowledge of FSSAI food safety standards
• Ability to work in a fast-paced environment
• Culinary degree or equivalent experience preferred

**What We Offer:**
• Competitive salary package
• Meals during shifts
• Growth opportunities
• Supportive work environment`,

      waiter: `**Position: ${roleData.label}**
${location ? `**Location:** ${location}` : ''}
${salary ? `**Salary:** ${salary}` : ''}
**Experience Required:** ${expData.label}

**About the Role:**
We are hiring friendly and professional ${roleData.label}s to join our front-of-house team. You will be the face of our restaurant, ensuring guests have an exceptional dining experience.

**Key Responsibilities:**
• Welcome guests warmly and escort them to tables
• Present menus, explain specials, and take accurate orders
• Serve food and beverages promptly and professionally
• Handle customer queries and resolve complaints gracefully
• Process payments and maintain accurate bills
• Maintain cleanliness of the dining area

**Requirements:**
• ${expData.label} in hospitality preferred
• Excellent communication skills in English and local language
• Pleasant personality and professional appearance
• Ability to work in shifts, weekends, and holidays
• Basic knowledge of food and beverages
• Team player with a positive attitude

**What We Offer:**
• Competitive salary + tips
• Free meals during shifts
• Training and development
• Career growth opportunities`,

      manager: `**Position: ${roleData.label}**
${location ? `**Location:** ${location}` : ''}
${salary ? `**Salary:** ${salary}` : ''}
**Experience Required:** ${expData.label}

**About the Role:**
We are seeking an experienced ${roleData.label} to oversee daily operations and lead our team to success. You will be responsible for driving revenue, maintaining service quality, and creating a positive work environment.

**Key Responsibilities:**
• Manage day-to-day restaurant operations
• Lead, train, and motivate staff across all departments
• Monitor and optimize revenue, costs, and profitability
• Ensure exceptional customer service and handle escalations
• Manage inventory, vendors, and supplier relationships
• Ensure compliance with all regulatory requirements
• Prepare reports and present to ownership

**Requirements:**
• ${expData.label} in restaurant management
• Proven track record of managing P&L
• Strong leadership and people management skills
• Excellent problem-solving abilities
• Knowledge of POS systems and restaurant technology
• Degree in hospitality management preferred

**What We Offer:**
• Competitive salary + performance bonus
• Health insurance
• Leadership role with autonomy
• Growth within the organization`,
    };

    return templates[role] || templates.waiter;
  };

  const handleLogin = () => {
    window.location.href = 'https://app.dineopen.com/login?redirect=' + encodeURIComponent(window.location.href);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJD);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              ✨ AI-Powered
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
                      <option key={r.value} value={r.value}>{r.label}</option>
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
                        {e.label.split(' ')[0]}
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
                    placeholder="e.g., ₹25,000 - ₹35,000/month"
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
                  {isGenerating ? 'Generating...' : '✨ Generate JD'}
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
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Generated JD</h3>
                  {generatedJD && (
                    <button
                      onClick={copyToClipboard}
                      style={{ padding: '8px 16px', backgroundColor: '#0891b2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Copy
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
              Create a free account to generate job descriptions. You get 10 free generations!
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#0891b2', color: 'white',
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
