'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaPlug, FaArrowRight } from 'react-icons/fa';

export default function IntegrationClient({ data }) {
  const { name, tagline, description, features, benefits, cta } = data;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              <FaPlug /> Integration
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              DineOpen + {name}
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '16px' }}>{tagline}</p>
            <p style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '32px' }}>{description}</p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              {cta} <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
            What You Get with {name} Integration
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ backgroundColor: '#ecfdf5', padding: '60px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: '32px' }}>
              Benefits
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {benefits.map((benefit, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: idx < benefits.length - 1 ? '1px solid #a7f3d0' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaCheck style={{ color: 'white', fontSize: '14px' }} />
                  </div>
                  <span style={{ fontSize: '16px', color: '#065f46', fontWeight: '500' }}>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              How to Connect
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {[
                { step: '1', title: 'Sign Up', desc: 'Create your free DineOpen account' },
                { step: '2', title: 'Connect', desc: `Link your ${name} account in settings` },
                { step: '3', title: 'Configure', desc: 'Set up menu sync and preferences' },
                { step: '4', title: 'Go Live', desc: 'Start receiving orders automatically' },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#111827', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Connect {name}?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Start your free 7-day trial. Integration is included at no extra cost.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
