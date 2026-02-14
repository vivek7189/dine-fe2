'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaFileAlt, FaFileExcel, FaFilePdf, FaDownload, FaUtensils, FaFileInvoice, FaBoxOpen, FaCalendarAlt, FaClipboardList, FaUsers, FaChartBar, FaCalculator } from 'react-icons/fa';

export default function TemplatesHubClient() {
  const templates = [
    {
      icon: <FaUtensils size={24} />,
      title: 'Restaurant Menu Template',
      description: 'Professional menu designs in multiple layouts. Easily customizable with your items and prices.',
      format: 'PDF & Canva',
      category: 'Menu',
      color: '#dc2626',
      downloads: '5,200+',
    },
    {
      icon: <FaFileInvoice size={24} />,
      title: 'GST Invoice Template',
      description: 'GST-compliant invoice format for restaurants. Includes all required fields and tax breakup.',
      format: 'Excel & PDF',
      category: 'Billing',
      color: '#7c3aed',
      downloads: '8,400+',
    },
    {
      icon: <FaBoxOpen size={24} />,
      title: 'Inventory Tracking Sheet',
      description: 'Track daily inventory, calculate consumption, and manage stock levels efficiently.',
      format: 'Excel',
      category: 'Inventory',
      color: '#0891b2',
      downloads: '4,100+',
    },
    {
      icon: <FaCalendarAlt size={24} />,
      title: 'Staff Schedule Template',
      description: 'Weekly staff scheduling with shift timings, leave tracking, and overtime calculation.',
      format: 'Excel',
      category: 'HR',
      color: '#059669',
      downloads: '3,800+',
    },
    {
      icon: <FaClipboardList size={24} />,
      title: 'Restaurant Startup Checklist',
      description: '50+ point checklist covering everything from licenses to launch day preparations.',
      format: 'PDF',
      category: 'Planning',
      color: '#ea580c',
      downloads: '6,700+',
    },
    {
      icon: <FaChartBar size={24} />,
      title: 'Business Plan Template',
      description: 'Comprehensive business plan format for restaurant investors and loan applications.',
      format: 'Word & PDF',
      category: 'Planning',
      color: '#2563eb',
      downloads: '4,500+',
      link: '/resources/business-plan',
    },
    {
      icon: <FaCalculator size={24} />,
      title: 'Food Costing Sheet',
      description: 'Calculate recipe costs, portion sizes, and ideal selling prices for each dish.',
      format: 'Excel',
      category: 'Finance',
      color: '#16a34a',
      downloads: '3,200+',
    },
    {
      icon: <FaUsers size={24} />,
      title: 'Employee Onboarding Checklist',
      description: 'Standardize new hire training with this comprehensive onboarding checklist.',
      format: 'PDF',
      category: 'HR',
      color: '#ca8a04',
      downloads: '2,100+',
    },
  ];

  const categories = [
    { name: 'All', count: templates.length },
    { name: 'Menu', count: templates.filter(t => t.category === 'Menu').length },
    { name: 'Billing', count: templates.filter(t => t.category === 'Billing').length },
    { name: 'Inventory', count: templates.filter(t => t.category === 'Inventory').length },
    { name: 'HR', count: templates.filter(t => t.category === 'HR').length },
    { name: 'Planning', count: templates.filter(t => t.category === 'Planning').length },
    { name: 'Finance', count: templates.filter(t => t.category === 'Finance').length },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaFileAlt /> Free Templates
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant Templates Library
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Free downloadable templates for menus, invoices, inventory, scheduling, and more. Excel, PDF, and editable formats.
            </p>
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '800' }}>8+</p>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Templates</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '800' }}>38K+</p>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Downloads</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '800' }}>100%</p>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Free</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section style={{ backgroundColor: 'white', padding: '24px 20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '64px', zIndex: 10 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((cat, idx) => (
              <button key={idx} style={{ padding: '8px 16px', backgroundColor: idx === 0 ? '#059669' : '#f3f4f6', color: idx === 0 ? 'white' : '#374151', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </section>

        {/* Templates Grid */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {templates.map((template, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '52px', height: '52px', backgroundColor: `${template.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: template.color }}>
                      {template.icon}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {template.format.includes('Excel') && <FaFileExcel style={{ color: '#16a34a', fontSize: '18px' }} />}
                      {template.format.includes('PDF') && <FaFilePdf style={{ color: '#dc2626', fontSize: '18px' }} />}
                      {template.format.includes('Word') && <FaFileAlt style={{ color: '#2563eb', fontSize: '18px' }} />}
                    </div>
                  </div>
                  <span style={{ padding: '3px 10px', backgroundColor: '#f3f4f6', borderRadius: '10px', fontSize: '11px', color: '#6b7280' }}>{template.category}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginTop: '12px', marginBottom: '8px' }}>{template.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>{template.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{template.downloads} downloads</span>
                    <Link href={template.link || '#'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: template.color, color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                      <FaDownload style={{ fontSize: '12px' }} /> Download
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Want These Built Into Your POS?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              DineOpen has invoicing, inventory, and scheduling built-in. No more spreadsheets!
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
