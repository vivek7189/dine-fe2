'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaLeaf, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaGlobe, FaYinYang, FaMountain, FaRupeeSign } from 'react-icons/fa';

export default function RishikeshPOSClient() {
  const cityFeatures = [
    { icon: <FaLeaf size={24} />, title: 'Vegan & Organic Tagging', description: 'Mark items as Vegan, Organic, Gluten-free, Raw. Perfect for health-conscious international tourists and yoga practitioners.' },
    { icon: <FaGlobe size={24} />, title: 'Multi-Currency & Languages', description: 'Display prices in USD, EUR, GBP alongside INR. QR menus in English, German, French, Spanish for foreign tourists.' },
    { icon: <FaYinYang size={24} />, title: 'Yoga Retreat Packages', description: 'Create meal packages for yoga retreats and teacher training programs. Bill multiple days in advance with special pricing.' },
    { icon: <FaMountain size={24} />, title: 'Rooftop & Ganga View Cafes', description: 'Table management for scenic seating. Sunset timing rush management for popular viewpoint cafes.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Rishikesh - Yoga Capital of the World
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant POS for<br />Rishikesh&apos;s Wellness Cafes
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '16px', maxWidth: '700px', margin: '0 auto 16px' }}>
              Running a yoga cafe, vegan restaurant, or rooftop cafe in Rishikesh? DineOpen handles international tourists, organic menus, and retreat packages seamlessly.
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>
              Just ₹999/month <span style={{ opacity: 0.8, fontSize: '16px' }}>• Multi-currency • Tourist-ready</span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial →
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section style={{ backgroundColor: '#ecfdf5', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Rishikesh Restaurant Challenges We Solve
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                'International tourists needing English menus',
                'Vegan/organic dietary requirement tracking',
                'Yoga retreat bulk meal packages',
                'Seasonal tourist rush management',
                'Multi-currency pricing for foreigners',
                'Ganga-view premium seating billing'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Built for Rishikesh&apos;s Unique Cafe Culture
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perfect For */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Perfect for Rishikesh Food Businesses
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { type: 'Yoga Cafe & Wellness Kitchens', desc: 'Sattvic meals for ashrams and yoga schools', areas: 'Laxman Jhula, Tapovan, Swarg Ashram' },
                { type: 'Rooftop & Ganga-View Cafes', desc: 'Scenic cafes serving international cuisine', areas: 'Ram Jhula, Beatles Ashram area' },
                { type: 'Vegan & Organic Restaurants', desc: 'Health food for conscious travelers', areas: 'Tapovan, High Bank area' },
                { type: 'Backpacker Cafes', desc: 'Budget-friendly cafes for travelers', areas: 'Laxman Jhula market, Badrinath Road' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', border: '2px solid #bbf7d0', borderRadius: '16px', backgroundColor: '#f0fdf4' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.type}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{item.desc}</p>
                  <p style={{ fontSize: '12px', color: '#059669' }}>Areas: {item.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '60px 20px', backgroundColor: '#ecfdf5' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#059669', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;80% of our customers are international. DineOpen&apos;s multi-language QR menu is perfect - German tourists read in German, French in French. The vegan tagging saves us from constant questions. Best investment for our cafe.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Maria & Ankit</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Ganga View Organic Cafe, Tapovan, Rishikesh</p>
          </div>
        </section>

        {/* Nearby Cities */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available Nearby</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[
                { name: 'Haridwar', href: '/pos/haridwar' },
                { name: 'Dehradun', href: '/pos/dehradun' },
                { name: 'Mussoorie', href: '/pos/mussoorie' },
                { name: 'Delhi', href: '/pos/delhi' },
              ].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#059669', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Grow Your Rishikesh Cafe?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Join cafes in Tapovan and Laxman Jhula using DineOpen.
            </p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
