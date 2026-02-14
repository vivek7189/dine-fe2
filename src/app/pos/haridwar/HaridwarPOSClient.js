'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaLeaf, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaUsers, FaUtensils, FaMobile, FaRupeeSign } from 'react-icons/fa';

export default function HaridwarPOSClient() {
  const cityFeatures = [
    {
      icon: <FaLeaf size={24} />,
      title: 'Pure Vegetarian Tagging',
      description: 'Mark items as Sattvic, No Onion-Garlic, Jain-friendly. Clear labels on menu and kitchen orders for pilgrims with dietary restrictions.'
    },
    {
      icon: <FaUsers size={24} />,
      title: 'Pilgrimage Rush Management',
      description: 'Handle Kumbh Mela, Kanwar Yatra, and daily pilgrim crowds. Quick billing for high-volume, low-ticket orders during peak seasons.'
    },
    {
      icon: <FaUtensils size={24} />,
      title: 'Thali & Bhojan System',
      description: 'Manage unlimited thali with fixed-price billing. Perfect for ashram bhojanalayas and dharamshala canteens serving prasad-style meals.'
    },
    {
      icon: <FaMobile size={24} />,
      title: 'Simple Hindi Interface',
      description: 'Easy-to-use interface in Hindi. Your staff can learn in minutes. Voice ordering in Hindi for faster service.'
    },
  ];

  const haridwarChallenges = [
    'Managing sudden pilgrim rushes during aarti timings',
    'Tracking no onion-garlic orders separately',
    'Handling bulk prasad and langar orders',
    'Seasonal business during Kumbh and Kanwar',
    'Simple billing for fixed-price thali system',
    'Multiple payment modes including UPI'
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero - Holy City Theme */}
        <section style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Haridwar, Uttarakhand - Holy City
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant POS for<br />Haridwar&apos;s Holy Restaurants
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '16px', maxWidth: '700px', margin: '0 auto 16px' }}>
              Serving millions of pilgrims visiting Har Ki Pauri? DineOpen understands Haridwar&apos;s unique needs - pure vegetarian menus, ashram bhojanalayas, and managing pilgrimage crowds.
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>
              Just ₹999/month <span style={{ opacity: 0.8, fontSize: '16px' }}>• No setup fee • Pure Veg features included</span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial →
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Haridwar Specific Challenges */}
        <section style={{ backgroundColor: '#fff7ed', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Running a Restaurant in Haridwar? We Understand Your Challenges
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {haridwarChallenges.map((challenge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#ea580c', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{challenge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* City-Specific Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Features Built for Haridwar Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Whether you run a restaurant near Har Ki Pauri, an ashram bhojanshala, or a cafe in Rishikund area
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ffedd5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Perfect for Haridwar&apos;s Food Businesses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { type: 'Pure Veg Restaurants', desc: 'Sattvic restaurants serving pilgrims near ghats and temples', areas: 'Har Ki Pauri, Railway Road, Jwalapur' },
                { type: 'Ashram Bhojanalayas', desc: 'Dharamshala and ashram canteens serving simple meals', areas: 'Shantikunj, Sapt Rishi, Kankhal' },
                { type: 'Sweet Shops', desc: 'Halwai shops and mithai stores for prasad', areas: 'Moti Bazaar, Bara Bazaar' },
                { type: 'Cafes & Dhabas', desc: 'Quick service restaurants for tourists and locals', areas: 'BHEL, Ranipur, Shivalik Nagar' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', border: '2px solid #fed7aa', borderRadius: '16px', backgroundColor: '#fffbeb' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.type}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{item.desc}</p>
                  <p style={{ fontSize: '12px', color: '#ea580c' }}>Areas: {item.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '60px 20px', backgroundColor: '#fff7ed' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#ea580c', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;During Kanwar Yatra, we serve 2000+ pilgrims daily. DineOpen&apos;s quick billing and pure veg tagging made our operations smooth. The Hindi voice ordering is perfect for our staff. Best decision for our bhojanshala.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Pandit Ramesh Sharma</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Ganga Bhojanshala, Har Ki Pauri, Haridwar</p>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Affordable for Haridwar Businesses
            </h2>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                <FaRupeeSign style={{ fontSize: '24px', color: '#ea580c' }} />
                <span style={{ fontSize: '56px', fontWeight: '800', color: '#ea580c' }}>999</span>
                <span style={{ fontSize: '18px', color: '#6b7280' }}>/month</span>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Everything included • No hidden fees • Cancel anytime</p>
              <ul style={{ textAlign: 'left', marginBottom: '24px' }}>
                {['Pure veg menu tagging', 'Hindi voice ordering', 'Unlimited orders', 'QR code menus', 'WhatsApp notifications', 'UPI & card payments'].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <FaCheck style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="https://dineopen.com/login" style={{ display: 'block', padding: '16px', backgroundColor: '#ea580c', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                Start 30-Day Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* Other Cities */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Also Available in Nearby Cities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[
                { name: 'Rishikesh', href: '/pos/rishikesh' },
                { name: 'Dehradun', href: '/pos/dehradun' },
                { name: 'Mussoorie', href: '/pos/mussoorie' },
                { name: 'Meerut', href: '/pos/meerut' },
                { name: 'Noida', href: '/pos/noida' },
                { name: 'Delhi', href: '/pos/delhi' },
                { name: 'Varanasi', href: '/pos/varanasi' },
                { name: 'Lucknow', href: '/pos/lucknow' },
              ].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#ea580c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Modernize Your Haridwar Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Join 50+ restaurants in Haridwar using DineOpen. Start your free trial today.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
