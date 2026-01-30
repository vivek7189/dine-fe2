'use client';

import { useRouter } from 'next/navigation';
import { FaUtensils, FaArrowLeft } from 'react-icons/fa';

export default function PrivacyPolicy() {
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
          Privacy Policy
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
              Introduction
            </h2>
            <p style={{ marginBottom: '16px' }}>
              DineOpen (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our restaurant management platform and services.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Information We Collect
            </h2>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Personal Information
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Name, email address, and phone number</li>
              <li style={{ marginBottom: '8px' }}>Restaurant business information</li>
              <li style={{ marginBottom: '8px' }}>Payment and billing information</li>
              <li style={{ marginBottom: '8px' }}>Account credentials and preferences</li>
            </ul>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Usage Data
            </h3>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Device information and IP address</li>
              <li style={{ marginBottom: '8px' }}>Browser type and version</li>
              <li style={{ marginBottom: '8px' }}>Pages visited and time spent</li>
              <li style={{ marginBottom: '8px' }}>Feature usage and interactions</li>
            </ul>

            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Device permissions (mobile app)
            </h3>
            <p style={{ marginBottom: '12px' }}>
              The DineOpen Staff mobile app may request access to your device camera. Camera access is used only when you choose to take a photo of a menu (e.g. in Menu Management) to extract menu items. Photos are processed to add items to your restaurant menu and are not used for any other purpose. You can deny camera permission; the app will still work, but the &quot;Take Photo&quot; menu feature will be unavailable.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              How We Use Your Information
            </h2>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Provide and maintain our services</li>
              <li style={{ marginBottom: '8px' }}>Process transactions and payments</li>
              <li style={{ marginBottom: '8px' }}>Send important notifications and updates</li>
              <li style={{ marginBottom: '8px' }}>Provide customer support</li>
              <li style={{ marginBottom: '8px' }}>Improve our products and services</li>
              <li style={{ marginBottom: '8px' }}>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Data Security
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>SSL/TLS encryption for data transmission</li>
              <li style={{ marginBottom: '8px' }}>Encrypted storage of sensitive data</li>
              <li style={{ marginBottom: '8px' }}>Regular security audits and updates</li>
              <li style={{ marginBottom: '8px' }}>Access controls and authentication</li>
              <li style={{ marginBottom: '8px' }}>Staff training on data protection</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Data Sharing and Disclosure
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Service providers who assist in our operations</li>
              <li style={{ marginBottom: '8px' }}>Legal compliance or law enforcement requests</li>
              <li style={{ marginBottom: '8px' }}>Protection of our rights and safety</li>
              <li style={{ marginBottom: '8px' }}>Business transfers or mergers</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Your Rights
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You have the right to:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Access your personal data</li>
              <li style={{ marginBottom: '8px' }}>Correct inaccurate information</li>
              <li style={{ marginBottom: '8px' }}>Request deletion of your data</li>
              <li style={{ marginBottom: '8px' }}>Export your data</li>
              <li style={{ marginBottom: '8px' }}>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Cookies and Tracking
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Data Retention
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce agreements.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Contact Us
            </h2>
            <p style={{ marginBottom: '16px' }}>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div style={{
              padding: '20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Email:</strong> privacy@dineopen.com
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Address:</strong> DineOpen Privacy Team<br />
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
              Changes to This Policy
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}