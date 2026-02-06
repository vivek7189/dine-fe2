'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaClipboardList, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';

export default function RestaurantLicensesClient() {
  const mandatoryLicenses = [
    {
      name: 'FSSAI Food License',
      authority: 'Food Safety and Standards Authority of India',
      cost: '₹2,000 - ₹7,500/year',
      timeline: '30-60 days',
      validity: '1-5 years',
      description: 'Mandatory for any food business. Type depends on turnover (Basic/State/Central).',
      link: '/resources/fssai-guide',
    },
    {
      name: 'GST Registration',
      authority: 'Central/State GST Department',
      cost: 'Free',
      timeline: '7-15 days',
      validity: 'Lifetime (unless cancelled)',
      description: 'Mandatory if turnover exceeds ₹20 Lakh (₹10 Lakh for special category states).',
      link: '/resources/gst-restaurants',
    },
    {
      name: 'Shop & Establishment License',
      authority: 'State Labour Department',
      cost: '₹500 - ₹5,000',
      timeline: '15-30 days',
      validity: '1-5 years',
      description: 'Required for all commercial establishments. Regulates working hours, holidays, wages.',
    },
    {
      name: 'Fire Safety NOC',
      authority: 'State Fire Department',
      cost: '₹5,000 - ₹25,000',
      timeline: '15-45 days',
      validity: '1-3 years',
      description: 'Mandatory for restaurants above certain size. Requires fire extinguishers, exits, etc.',
    },
    {
      name: 'Health/Trade License',
      authority: 'Municipal Corporation',
      cost: '₹1,000 - ₹10,000',
      timeline: '15-30 days',
      validity: '1 year',
      description: 'Issued after health inspection. Ensures hygiene and sanitation standards.',
    },
    {
      name: 'Signage License',
      authority: 'Municipal Corporation',
      cost: '₹500 - ₹10,000',
      timeline: '7-15 days',
      validity: '1 year',
      description: 'Required for any signboard or hoarding displayed outside premises.',
    },
  ];

  const conditionalLicenses = [
    {
      name: 'Liquor License',
      authority: 'State Excise Department',
      cost: '₹5-50 Lakh (varies by state)',
      timeline: '60-180 days',
      validity: '1 year',
      description: 'Required to serve alcohol. Process and cost vary significantly by state.',
      condition: 'If serving alcohol',
    },
    {
      name: 'Music License (PPL/IPRS)',
      authority: 'Phonographic Performance Ltd / IPRS',
      cost: '₹10,000 - ₹1 Lakh/year',
      timeline: '7-15 days',
      validity: '1 year',
      description: 'Required to play copyrighted music. Separate licenses for PPL and IPRS.',
      condition: 'If playing music',
    },
    {
      name: 'Eating House License',
      authority: 'Police Commissioner',
      cost: '₹2,000 - ₹10,000',
      timeline: '30-60 days',
      validity: '1 year',
      description: 'Required in some states for restaurants open late night (after 11 PM).',
      condition: 'If open late night',
    },
    {
      name: 'Pollution NOC',
      authority: 'State Pollution Control Board',
      cost: '₹5,000 - ₹25,000',
      timeline: '30-60 days',
      validity: '1-5 years',
      description: 'Required for restaurants with tandoor, grill, or heavy cooking that produces emissions.',
      condition: 'If using tandoor/grill',
    },
    {
      name: 'Lift License',
      authority: 'Chief Inspector of Lifts',
      cost: '₹5,000 - ₹15,000',
      timeline: '30-45 days',
      validity: '1 year',
      description: 'Required if premises has an elevator for customer/staff use.',
      condition: 'If premises has lift',
    },
  ];

  const stateSpecific = [
    { state: 'Maharashtra', special: 'Eating House License mandatory for late-night operations. Strict liquor license process.' },
    { state: 'Delhi', special: 'Health Trade License from MCD. DPCC NOC for large kitchens.' },
    { state: 'Karnataka', special: 'Excise license categories vary. Music license strictly enforced.' },
    { state: 'Tamil Nadu', special: 'TNPCB clearance for commercial kitchens. Strict fire safety norms.' },
    { state: 'Gujarat', special: 'No liquor license available (dry state). Focus on FSSAI and health permits.' },
    { state: 'Goa', special: 'Tourism department registration for tourist areas. Beach shack permits seasonal.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaClipboardList /> Complete License Guide
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant Licenses & Permits India
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Complete checklist of all licenses required to legally operate a restaurant in India. Costs, timelines, and application process.
            </p>
          </div>
        </section>

        {/* Summary Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>6</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Mandatory Licenses</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>₹10-50K</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Typical License Cost</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>2-3</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Months to Complete</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>5+</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Conditional Licenses</p>
            </div>
          </div>
        </section>

        {/* Mandatory Licenses */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Mandatory Licenses
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px' }}>
              These are required for ALL restaurants in India
            </p>
            <div style={{ display: 'grid', gap: '20px' }}>
              {mandatoryLicenses.map((license, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #059669' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{license.name}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{license.authority}</p>
                      <p style={{ fontSize: '14px', color: '#374151' }}>{license.description}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center', minWidth: '300px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{license.cost}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Cost</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{license.timeline}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Timeline</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{license.validity}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Validity</p>
                      </div>
                    </div>
                  </div>
                  {license.link && (
                    <Link href={license.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '13px', color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                      Read detailed guide <FaArrowRight style={{ fontSize: '10px' }} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conditional Licenses */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Conditional Licenses
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px' }}>
              Required based on your restaurant type and services
            </p>
            <div style={{ display: 'grid', gap: '20px' }}>
              {conditionalLicenses.map((license, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{license.name}</h3>
                        <span style={{ padding: '2px 8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', borderRadius: '4px', fontWeight: '500' }}>{license.condition}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{license.authority}</p>
                      <p style={{ fontSize: '14px', color: '#374151' }}>{license.description}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center', minWidth: '300px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{license.cost}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Cost</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{license.timeline}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Timeline</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{license.validity}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Validity</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* State Specific */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              State-Specific Requirements
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {stateSpecific.map((item, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>{item.state}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{item.special}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Start Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Get your licenses in order and set up your restaurant with DineOpen.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/resources/startup-guide"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '18px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                Complete Startup Guide <FaArrowRight />
              </Link>
              <Link
                href="https://app.dineopen.com/register"
                style={{ display: 'inline-block', padding: '18px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                Try DineOpen Free
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
