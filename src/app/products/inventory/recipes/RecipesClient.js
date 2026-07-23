'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaUtensils, FaCalculator, FaPercent, FaLayerGroup, FaBalanceScale, FaSyncAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function RecipesClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <FaUtensils size={28} />,
      title: 'Recipe Builder with Ingredient Mapping',
      desc: 'Create recipes by selecting ingredients from your inventory. Specify exact quantities with proper units (grams, ml, pieces, etc.). Each ingredient is linked to your stock, so when orders come in, the right quantities are automatically deducted from inventory.'
    },
    {
      icon: <FaCalculator size={28} />,
      title: 'Automatic Cost Calculation',
      desc: 'DineOpen calculates recipe cost by multiplying each ingredient quantity by its latest purchase price. Total recipe cost updates in real-time when supplier prices change. See cost breakdown per ingredient to identify expensive components and find savings.'
    },
    {
      icon: <FaPercent size={28} />,
      title: 'Food Cost Percentage Tracking',
      desc: 'Food cost percentage = (recipe cost / menu selling price) x 100. The industry benchmark is 28-35%. DineOpen flags menu items exceeding your target food cost percentage with red indicators. Helps you price menus profitably.'
    },
    {
      icon: <FaLayerGroup size={28} />,
      title: 'Sub-Recipe Support',
      desc: 'Create base preparations like sauces, marinades, spice mixes, and dough as sub-recipes. Use them as ingredients in main recipes. Costs cascade through all levels automatically. Update a sub-recipe cost and every dish using it recalculates.'
    },
    {
      icon: <FaBalanceScale size={28} />,
      title: 'Portion Control & Scaling',
      desc: 'Define standard portion sizes for each recipe. Scale recipes up or down for half portions, family size, or catering quantities while maintaining correct ingredient ratios. Standardized portions reduce waste and ensure consistency across shifts.'
    },
    {
      icon: <FaSyncAlt size={28} />,
      title: 'Menu-Recipe Synchronization',
      desc: 'Link recipes to menu items so that every order automatically deducts the right ingredients from inventory. When you update a recipe, the menu item cost and food cost percentage update immediately. Track theoretical vs actual ingredient usage.'
    },
  ];

  const exampleRecipe = [
    { ingredient: 'Chicken Breast', qty: '200g', cost: 'Rs.60' },
    { ingredient: 'Olive Oil', qty: '15ml', cost: 'Rs.8' },
    { ingredient: 'Garlic', qty: '10g', cost: 'Rs.3' },
    { ingredient: 'Onion', qty: '50g', cost: 'Rs.5' },
    { ingredient: 'Tomato Sauce', qty: '30ml', cost: 'Rs.7' },
    { ingredient: 'Spice Mix (sub-recipe)', qty: '5g', cost: 'Rs.4' },
  ];

  const faqs = [
    { q: 'How does recipe costing work?', a: 'Create a recipe by adding ingredients from your inventory with exact quantities. DineOpen multiplies each ingredient quantity by its current purchase price to calculate total recipe cost. When prices change, all recipe costs update automatically.' },
    { q: 'Can I track food cost percentage?', a: 'Yes. DineOpen calculates food cost percentage as (recipe cost / selling price) x 100. Industry standard is 28-35%. Get alerts when items exceed your target food cost percentage.' },
    { q: 'Does it support sub-recipes?', a: 'Yes. Create base preparations (sauces, marinades, dough) as sub-recipes. Use them as ingredients in other recipes. Costs cascade automatically through all levels.' },
    { q: 'Can I scale recipes for different portions?', a: 'Yes. Define standard portion size and scale up or down. Create variations for half portions, family size, or catering quantities. Each scaled version shows accurate costs.' },
    { q: 'How does recipe costing reduce food waste?', a: 'By defining exact ingredient quantities per recipe, kitchen staff follows standardized portions. This prevents overuse, ensures consistency, and makes stock consumption predictable.' },
    { q: 'Can I see which recipes use a specific ingredient?', a: 'Yes. On any ingredient page, view all recipes that use it. Useful when an ingredient price changes or becomes unavailable - quickly identify affected menu items.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Recipe Costing</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Recipe Costing & Ingredient Mapping
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Map ingredients to recipes with exact quantities, calculate costs automatically, track food cost percentages, and scale portions. Every price change updates all recipe costs in real-time.
            </p>
            <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Example Recipe Cost Breakdown */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Example: Grilled Chicken Recipe Cost</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '13px' }}>Ingredient</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'white', fontSize: '13px' }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: 'white', fontSize: '13px' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleRecipe.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{row.ingredient}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>{row.qty}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', fontWeight: '600', textAlign: 'right' }}>{row.cost}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <td colSpan="2" style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#111827' }}>Total Recipe Cost</td>
                    <td style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '800', color: '#ef4444', textAlign: 'right' }}>Rs.87</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>Selling Price: Rs.299 | Food Cost: 29.1%</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#22c55e', fontWeight: '600', textAlign: 'right' }}>Healthy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Recipe Costing Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/inventory', title: 'Inventory Overview', desc: 'Complete inventory management.' },
                { href: '/products/inventory/stock', title: 'Stock Management', desc: 'Track ingredients in real-time.' },
                { href: '/products/inventory/suppliers', title: 'Suppliers', desc: 'Ingredient pricing from suppliers.' },
                { href: '/products/inventory/purchase-orders', title: 'Purchase Orders', desc: 'Order ingredients from suppliers.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af', flexShrink: 0, marginLeft: '12px' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Recipe Costing FAQ</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === idx && <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Start Costing Your Recipes Today</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Know exactly what each dish costs. Free 7-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
