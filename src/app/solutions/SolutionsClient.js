'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaUtensils, FaArrowRight, FaCoffee, FaTruck, FaBuilding, FaIceCream, FaBeer, FaHamburger, FaCookie, FaStore, FaConciergeBell } from 'react-icons/fa';

export default function SolutionsClient() {
  const solutions = [
    { name: 'Restaurants', href: '/for/restaurants', desc: 'Full-service restaurants', icon: FaUtensils },
    { name: 'Cafes', href: '/for/cafes', desc: 'Coffee shops & cafes', icon: FaCoffee },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only kitchens', icon: FaTruck },
    { name: 'QSR & Fast Food', href: '/for/qsr', desc: 'Quick service restaurants', icon: FaHamburger },
    { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Premium dining experiences', icon: FaConciergeBell },
    { name: 'Food Courts', href: '/for/food-courts', desc: 'Multi-vendor food courts', icon: FaBuilding },
    { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile food businesses', icon: FaTruck },
    { name: 'Bakeries', href: '/for/bakeries', desc: 'Bakeries & pastry shops', icon: FaCookie },
    { name: 'Ice Cream Parlors', href: '/for/ice-cream-parlors', desc: 'Ice cream & desserts', icon: FaIceCream },
    { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Bars, pubs & breweries', icon: FaBeer },
    { name: 'Hotels', href: '/for/hotels', desc: 'Hotel restaurants', icon: FaBuilding },
    { name: 'Canteens', href: '/for/canteens', desc: 'Corporate & school canteens', icon: FaStore },
    { name: 'Catering', href: '/for/catering', desc: 'Catering businesses', icon: FaConciergeBell },
    { name: 'Sweet Shops', href: '/for/sweet-shops', desc: 'Sweet & confectionery shops', icon: FaCookie },
    { name: 'Juice Bars', href: '/for/juice-bars', desc: 'Juice bars & smoothie shops', icon: FaCoffee },
    { name: 'Pizza Shops', href: '/for/pizza-shops', desc: 'Pizza restaurants', icon: FaStore },
  ];

  const indianSolutions = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants', desc: 'Multi-cuisine Indian' },
    { name: 'Biryani Restaurants', href: '/for/biryani-restaurants', desc: 'Hyderabadi, Lucknowi biryani' },
    { name: 'Thali Restaurants', href: '/for/thali-restaurants', desc: 'Gujarati, Rajasthani thali' },
    { name: 'South Indian', href: '/for/south-indian-restaurants', desc: 'Dosa, idli, filter coffee' },
    { name: 'North Indian', href: '/for/north-indian-restaurants', desc: 'Punjabi, Mughlai cuisine' },
    { name: 'Dhabas', href: '/for/dhabas', desc: 'Highway restaurants' },
    { name: 'Mithai Shops', href: '/for/mithai-shops', desc: 'Indian sweets & namkeen' },
    { name: 'Chai Tapri', href: '/for/chai-tapri', desc: 'Tea stalls & chai cafes' },
    { name: 'Street Food', href: '/for/street-food', desc: 'Chaat, vada pav, golgappa' },
    { name: 'Chinese Restaurants', href: '/for/chinese-restaurants', desc: 'Indo-Chinese cuisine' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant Solutions for Every Business
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Whether you run a cafe, cloud kitchen, fine dining, or food truck - DineOpen has the perfect POS solution tailored for your business type.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* All Solutions */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Solutions by Business Type
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Find the perfect POS solution for your restaurant type
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {solutions.map((solution, idx) => (
                <Link key={idx} href={solution.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <solution.icon style={{ fontSize: '20px', color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{solution.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{solution.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Indian Cuisine Solutions */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🇮🇳</span>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Solutions for Indian Cuisines
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Specialized features for Indian restaurant types
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {indianSolutions.map((solution, idx) => (
                <Link key={idx} href={solution.href} style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{solution.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{solution.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
              Not Sure Which Solution Fits?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Talk to our experts and get a personalized recommendation for your business.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/contact"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Contact Sales
              </Link>
              <Link
                href="/india"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Explore India Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
