'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaMapMarkerAlt, FaStar, FaCity, FaUtensils, FaFileAlt, FaTools, FaArrowRight, FaRupeeSign, FaMobile, FaShieldAlt } from 'react-icons/fa';

export default function IndiaHubClient() {
  const stats = [
    { value: '50,000+', label: 'Restaurants in India' },
    { value: '25+', label: 'Cities Covered' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.8/5', label: 'Customer Rating' },
  ];

  const whyIndia = [
    { icon: FaRupeeSign, title: 'GST-Compliant Billing', desc: 'Auto-generate GST invoices with CGST, SGST, IGST. GSTR-1 ready reports.' },
    { icon: FaShieldAlt, title: 'FSSAI Compliant', desc: 'Display FSSAI license on bills, track expiry, stay audit-ready.' },
    { icon: FaMobile, title: 'UPI & Digital Payments', desc: 'GPay, PhonePe, Paytm, Razorpay - all payment modes supported.' },
    { icon: FaUtensils, title: 'Zomato & Swiggy', desc: 'Direct integration with delivery platforms. Auto-accept orders.' },
  ];

  const cities = [
    { name: 'Mumbai', href: '/pos/mumbai', restaurants: '10,000+' },
    { name: 'Delhi', href: '/pos/delhi', restaurants: '8,000+' },
    { name: 'Bangalore', href: '/pos/bangalore', restaurants: '7,000+' },
    { name: 'Chennai', href: '/pos/chennai', restaurants: '5,000+' },
    { name: 'Hyderabad', href: '/pos/hyderabad', restaurants: '4,500+' },
    { name: 'Pune', href: '/pos/pune', restaurants: '4,000+' },
    { name: 'Kolkata', href: '/pos/kolkata', restaurants: '3,500+' },
    { name: 'Ahmedabad', href: '/pos/ahmedabad', restaurants: '3,000+' },
    { name: 'Jaipur', href: '/pos/jaipur', restaurants: '2,000+' },
    { name: 'Lucknow', href: '/pos/lucknow', restaurants: '1,500+' },
    { name: 'Chandigarh', href: '/pos/chandigarh', restaurants: '1,200+' },
    { name: 'Kochi', href: '/pos/kochi', restaurants: '1,000+' },
    { name: 'Goa', href: '/pos/goa', restaurants: '800+' },
    { name: 'Surat', href: '/pos/surat', restaurants: '1,500+' },
    { name: 'Indore', href: '/pos/indore', restaurants: '1,200+' },
    { name: 'Nagpur', href: '/pos/nagpur', restaurants: '900+' },
    { name: 'Coimbatore', href: '/pos/coimbatore', restaurants: '800+' },
  ];

  const states = [
    { name: 'Maharashtra', href: '/india/maharashtra', cities: 'Mumbai, Pune, Nagpur' },
    { name: 'Karnataka', href: '/india/karnataka', cities: 'Bangalore, Mysore, Mangalore' },
    { name: 'Tamil Nadu', href: '/india/tamil-nadu', cities: 'Chennai, Coimbatore, Madurai' },
    { name: 'Delhi NCR', href: '/india/delhi-ncr', cities: 'Delhi, Noida, Gurgaon' },
    { name: 'Gujarat', href: '/india/gujarat', cities: 'Ahmedabad, Surat, Vadodara' },
  ];

  const industries = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants', desc: 'Thali, tandoor, biryani' },
    { name: 'Biryani Restaurants', href: '/for/biryani-restaurants', desc: 'Hyderabadi, Lucknowi' },
    { name: 'Thali Restaurants', href: '/for/thali-restaurants', desc: 'Gujarati, Rajasthani' },
    { name: 'South Indian', href: '/for/south-indian-restaurants', desc: 'Dosa, idli, filter coffee' },
    { name: 'North Indian', href: '/for/north-indian-restaurants', desc: 'Punjabi, Mughlai' },
    { name: 'Dhabas', href: '/for/dhabas', desc: 'Highway restaurants' },
    { name: 'Mithai Shops', href: '/for/mithai-shops', desc: 'Indian sweets' },
    { name: 'Chai Tapri', href: '/for/chai-tapri', desc: 'Tea stalls, chai cafes' },
    { name: 'Street Food', href: '/for/street-food', desc: 'Chaat, vada pav' },
    { name: 'Cafes', href: '/for/cafes', desc: 'Coffee shops' },
    { name: 'QSR', href: '/for/qsr', desc: 'Quick service' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only' },
    { name: 'College Canteens', href: '/for/college-canteens', desc: 'University canteens' },
    { name: 'Tiffin Services', href: '/for/tiffin-services', desc: 'Meal subscriptions' },
  ];

  const compliance = [
    { name: 'FSSAI Registration Guide', href: '/resources/fssai-registration', desc: 'Step-by-step FSSAI process' },
    { name: 'GST for Restaurants', href: '/resources/gst-restaurants', desc: 'GST rates & filing guide' },
    { name: 'Restaurant Licenses India', href: '/resources/restaurant-licenses-india', desc: 'All licenses you need' },
    { name: 'GST Filing Guide', href: '/resources/gst-filing-restaurants', desc: 'Monthly compliance' },
    { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act', desc: 'State-wise requirements' },
    { name: 'Fire Safety NOC', href: '/resources/fire-safety-noc', desc: 'NOC requirements' },
    { name: 'Liquor License Guide', href: '/resources/liquor-license-guide', desc: 'Bar & restaurant licenses' },
    { name: 'Swiggy Registration', href: '/resources/swiggy-onboarding', desc: 'List on Swiggy' },
    { name: 'Zomato Registration', href: '/resources/zomato-onboarding', desc: 'List on Zomato' },
    { name: 'Google Business Guide', href: '/resources/google-business-guide', desc: 'Get found on Google' },
  ];

  const tools = [
    { name: 'GST Calculator', href: '/tools/gst-calculator', desc: 'Calculate GST on food bills' },
    { name: 'FSSAI Fee Calculator', href: '/tools/fssai-fee-calculator', desc: 'License fee estimator' },
    { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Recipe costing' },
    { name: 'Swiggy Commission', href: '/tools/swiggy-calculator', desc: 'Calculate Swiggy fees' },
    { name: 'Zomato Commission', href: '/tools/zomato-calculator', desc: 'Calculate Zomato fees' },
    { name: 'Restaurant Profit', href: '/tools/profit-margin-calculator', desc: 'Profit margin calculator' },
    { name: 'Closing Checklist', href: '/tools/closing-checklist', desc: 'Daily closing tasks' },
    { name: 'Inventory Par Calculator', href: '/tools/inventory-par-calculator', desc: 'Set stock par levels' },
    { name: 'Waste Calculator', href: '/tools/waste-calculator', desc: 'Track food waste' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px' }}>
              <span style={{ fontSize: '20px' }}>🇮🇳</span>
              <span style={{ fontWeight: '600' }}>Made for Indian Restaurants</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              #1 Restaurant POS Software in India
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              GST-compliant billing, FSSAI ready, Zomato/Swiggy integration, UPI payments, Hindi voice ordering.
              Trusted by 50,000+ restaurants across India.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                style={{ padding: '18px 36px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Book Demo
              </Link>
            </div>
            <p style={{ marginTop: '20px', opacity: 0.8 }}>Starting at ₹999/month • 30-day free trial • No credit card</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why India */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Built for Indian Restaurant Businesses
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              DineOpen understands the unique needs of Indian restaurants - from GST compliance to regional cuisines.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              {whyIndia.map((item, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <item.icon style={{ fontSize: '24px', color: '#ef4444' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cities */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaCity style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Available in 25+ Indian Cities
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Local support, regional language, city-specific features
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {cities.map((city, idx) => (
                <Link key={idx} href={city.href} style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{city.name}</div>
                  <div style={{ fontSize: '13px', color: '#ef4444' }}>{city.restaurants} restaurants</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* States */}
        <div style={{ padding: '80px 20px', backgroundColor: '#fef2f2' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Explore by State
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {states.map((state, idx) => (
                <Link key={idx} href={state.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{state.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{state.cities}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Industries */}
        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaUtensils style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                POS for Every Indian Cuisine
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Specialized features for different restaurant types
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {industries.map((ind, idx) => (
                <Link key={idx} href={ind.href} style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{ind.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{ind.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div style={{ padding: '80px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaFileAlt style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Compliance Guides for Indian Restaurants
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Stay compliant with FSSAI, GST, and other regulations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {compliance.map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Free Tools */}
        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaTools style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Free Tools for Indian Restaurants
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Calculators and tools to help you run your restaurant better
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {tools.map((tool, idx) => (
                <Link key={idx} href={tool.href} style={{ display: 'block', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', textDecoration: 'none', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{tool.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{tool.desc}</div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/tools" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>
                View All 35+ Free Tools →
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ padding: '80px 20px', backgroundColor: '#111827', color: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>&ldquo;</div>
            <p style={{ fontSize: '24px', fontStyle: 'italic', marginBottom: '32px', lineHeight: 1.6 }}>
              DineOpen transformed our restaurant operations. GST billing is automatic, Zomato orders come directly to kitchen, and the Hindi voice ordering feature is loved by our staff. Best investment we made.
            </p>
            <div>
              <p style={{ fontWeight: '700', fontSize: '18px' }}>Priya Patel</p>
              <p style={{ opacity: 0.8 }}>Owner, Spice Garden - Mumbai (3 outlets)</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '20px' }}>
              Ready to Transform Your Restaurant?
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Join 50,000+ Indian restaurants using DineOpen. Free 30-day trial, no credit card required.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
