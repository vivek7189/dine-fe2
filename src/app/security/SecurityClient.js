'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaLock, FaShieldAlt, FaServer, FaKey, FaUserShield, FaCloudUploadAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

export default function SecurityClient() {
  const securityFeatures = [
    {
      icon: <FaLock size={28} />,
      title: '256-bit SSL Encryption',
      description: 'All data transmitted between your devices and our servers is encrypted using industry-standard TLS 1.3 encryption.',
    },
    {
      icon: <FaServer size={28} />,
      title: 'Secure Cloud Infrastructure',
      description: 'Hosted on AWS/Google Cloud with SOC 2 Type II compliance. Multiple availability zones ensure 99.9% uptime.',
    },
    {
      icon: <FaCreditCard size={28} />,
      title: 'PCI DSS Compliant',
      description: 'Payment processing meets PCI DSS Level 1 standards. Card data is tokenized and never stored on our servers.',
    },
    {
      icon: <FaCloudUploadAlt size={28} />,
      title: 'Automatic Backups',
      description: 'Your data is backed up every hour to multiple geographic locations. 30-day backup retention with instant restore.',
    },
    {
      icon: <FaKey size={28} />,
      title: 'Role-Based Access',
      description: 'Control who sees what with granular permissions. Staff, managers, and owners have different access levels.',
    },
    {
      icon: <FaUserShield size={28} />,
      title: 'Two-Factor Authentication',
      description: 'Optional 2FA for all accounts. Protect your data even if passwords are compromised.',
    },
  ];

  const compliance = [
    { name: 'GDPR Compliant', description: 'Full compliance with EU data protection regulations' },
    { name: 'PCI DSS Level 1', description: 'Highest level of payment card security' },
    { name: 'SOC 2 Type II', description: 'Audited security controls for cloud services' },
    { name: 'ISO 27001', description: 'International information security standard' },
    { name: 'DPDP Act Ready', description: 'Prepared for India\'s data protection law' },
  ];

  const dataProtection = [
    'Customer data is encrypted at rest using AES-256',
    'Passwords are hashed using bcrypt with salt',
    'API keys and secrets stored in secure vaults',
    'Regular penetration testing by third parties',
    'Security patches applied within 24 hours',
    'Employee access logged and monitored',
    'Annual security audits and certifications',
    'Bug bounty program for responsible disclosure',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaShieldAlt /> Security & Compliance
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Your Data Security is Our Priority
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Enterprise-grade security protecting your restaurant data. Encryption, secure payments, regular backups, and compliance certifications.
            </p>
          </div>
        </section>

        {/* Security Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How We Protect Your Data
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {securityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', marginBottom: '20px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Compliance & Certifications
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {compliance.map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Protection List */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Data Protection Measures
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {dataProtection.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Locations */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Data Storage & Residency
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px' }}>
              Your data is stored in data centers located in Mumbai, India for Indian customers. We ensure data residency compliance with local regulations. Enterprise customers can choose specific data center locations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>Mumbai</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Primary (India)</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>Singapore</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Backup (APAC)</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>99.9%</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Uptime SLA</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Security */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Security Questions?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Contact our security team for compliance documentation, penetration test reports, or custom security requirements.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="mailto:security@dineopen.com"
                style={{ display: 'inline-block', padding: '18px 32px', backgroundColor: 'white', color: '#1e3a5f', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                security@dineopen.com
              </Link>
              <Link
                href="https://dineopen.com/login"
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
