'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';
import { FaQrcode, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

export default function QRMenuGeneratorClient() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'QR Menu Generator' }]} />

      <div style={{ paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              Free Tool &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>QR Code Menu Generator for Restaurants</h1>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '24px' }}>
              Create a free QR code for your restaurant menu in 30 seconds. No sign-up needed.
            </p>
            <Link href="/tools/qr-menu-maker" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 32px', backgroundColor: 'white', color: '#2563eb',
              borderRadius: '10px', fontWeight: '700', fontSize: '18px', textDecoration: 'none'
            }}>
              <FaQrcode /> Create Your QR Menu Now <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Why Use a QR Code Menu?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Zero Printing Costs', desc: 'Update your menu anytime without reprinting. Save thousands on printing costs every month.' },
                { title: 'Contactless & Hygienic', desc: 'Guests scan and view the menu on their own phone. No shared physical menus.' },
                { title: 'Update Instantly', desc: 'Change prices, add specials, mark items as sold out — changes reflect in real-time.' },
                { title: 'Works on Any Phone', desc: 'No app download needed. Every smartphone camera can scan QR codes natively.' },
                { title: 'Better Guest Experience', desc: 'Beautiful digital menus with photos, descriptions, and dietary info.' },
                { title: 'Track Engagement', desc: 'See how many guests scan your QR code and which items they view most.' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCheckCircle style={{ color: '#2563eb' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA to QR Maker */}
        <section style={{ padding: '60px 20px', backgroundColor: '#eff6ff', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <FaQrcode style={{ fontSize: '48px', color: '#2563eb', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Ready to Create Your QR Menu?</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Our free QR Menu Maker lets you generate and download a custom QR code in seconds. No login, no signup.
            </p>
            <Link href="/tools/qr-menu-maker" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 32px', backgroundColor: '#2563eb', color: 'white',
              borderRadius: '10px', fontWeight: '700', fontSize: '18px', textDecoration: 'none'
            }}>
              <FaQrcode /> Open Free QR Menu Maker <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* DineOpen CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#2563eb', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Want a Full Digital Menu System?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>
              DineOpen gives you QR menus with photos, themes, multi-language support, online ordering, and POS integration.
            </p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/qr-menu-generator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
