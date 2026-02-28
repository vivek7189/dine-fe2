'use client';

import { useRouter } from 'next/navigation';
import { FaUtensils, FaArrowLeft } from 'react-icons/fa';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }} onClick={() => router.push('/')}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUtensils color="white" size={20} />
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              DineOpen
            </span>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <FaArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 20px',
        backgroundColor: 'white',
        marginTop: '40px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Terms of Service
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          Last updated: December 2024
        </p>

        <div style={{ lineHeight: '1.8', color: '#374151' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Agreement to Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              By accessing and using DineOpen (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Description of Service
            </h2>
            <p style={{ marginBottom: '16px' }}>
              DineOpen provides a comprehensive restaurant management platform that includes:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Point of Sale (POS) system</li>
              <li style={{ marginBottom: '8px' }}>Digital menu management</li>
              <li style={{ marginBottom: '8px' }}>Table and floor management</li>
              <li style={{ marginBottom: '8px' }}>Kitchen order tracking (KOT)</li>
              <li style={{ marginBottom: '8px' }}>Analytics and reporting</li>
              <li style={{ marginBottom: '8px' }}>Staff management tools</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              User Accounts
            </h2>
            <p style={{ marginBottom: '16px' }}>
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Provide accurate and complete information</li>
              <li style={{ marginBottom: '8px' }}>Maintain the security of your account credentials</li>
              <li style={{ marginBottom: '8px' }}>Notify us immediately of any unauthorized access</li>
              <li style={{ marginBottom: '8px' }}>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Acceptable Use
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You agree not to:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Use the Service for any illegal purposes</li>
              <li style={{ marginBottom: '8px' }}>Attempt to gain unauthorized access to our systems</li>
              <li style={{ marginBottom: '8px' }}>Interfere with or disrupt the Service</li>
              <li style={{ marginBottom: '8px' }}>Upload malicious code or viruses</li>
              <li style={{ marginBottom: '8px' }}>Violate any applicable laws or regulations</li>
              <li style={{ marginBottom: '8px' }}>Harass or abuse other users</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Subscription and Payment
            </h2>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Billing
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Subscription fees are billed monthly or annually</li>
              <li style={{ marginBottom: '8px' }}>All fees are non-refundable unless required by law</li>
              <li style={{ marginBottom: '8px' }}>You authorize us to charge your payment method</li>
              <li style={{ marginBottom: '8px' }}>Prices may change with 30 days notice</li>
            </ul>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Free Trial
            </h3>
            <p style={{ marginBottom: '16px' }}>
              We offer a 14-day free trial for new users. Your subscription will automatically begin after the trial period unless you cancel before it ends.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Data and Privacy
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Your data privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. You retain ownership of your data, and we provide tools to export or delete your data upon request.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Service Availability
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We strive to maintain high availability but cannot guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect access. We are not liable for any losses resulting from service interruptions.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Intellectual Property
            </h2>
            <p style={{ marginBottom: '16px' }}>
              The Service and its original content, features, and functionality are owned by DineOpen and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Termination
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You may terminate your account at any time. We may suspend or terminate your access to the Service at our discretion, with or without cause or notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Limitation of Liability
            </h2>
            <p style={{ marginBottom: '16px' }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, DINEFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Governing Law
            </h2>
            <p style={{ marginBottom: '16px' }}>
              These Terms shall be interpreted and governed by the laws of India. Any disputes relating to these Terms will be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Contact Information
            </h2>
            <p style={{ marginBottom: '16px' }}>
              If you have any questions about these Terms, please contact us:
            </p>
            <div style={{
              padding: '20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Email:</strong> legal@dineopen.com
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Address:</strong> DineOpen Legal Team<br />
                123 Tech Street, Digital City<br />
                India 110001
              </p>
            </div>
          </section>

          <section>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Changes to Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}