'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', toast: '$69+/month', square: '$60+/month', foodics: '$150+/month', winner: 'dineopen' },
  { feature: 'Multi-Brand Support', dineopen: 'Unlimited brands', toast: 'Limited', square: 'Separate accounts', foodics: 'Up to 5', winner: 'dineopen' },
  { feature: 'Delivery Integration', dineopen: 'All platforms', toast: 'US only', square: 'Limited', foodics: 'MENA only', winner: 'dineopen' },
  { feature: 'Virtual Brand Launch', dineopen: 'Minutes', toast: 'Days', square: 'New account needed', foodics: 'Hours', winner: 'dineopen' },
  { feature: 'Analytics Per Brand', dineopen: 'Real-time', toast: 'Basic', square: 'Separate dashboards', foodics: 'Available', winner: 'dineopen' },
  { feature: 'Kitchen Display (KDS)', dineopen: 'Per brand/station', toast: 'Single view', square: 'Basic', foodics: 'Available', winner: 'dineopen' },
  { feature: 'Contract', dineopen: 'Month-to-month', toast: '2-year lock-in', square: 'Month-to-month', foodics: 'Annual', winner: 'dineopen' },
];

const features = [
  {
    title: 'Multi-Brand Menu Management',
    desc: 'Create and manage separate menus, pricing, and branding for each virtual brand from a single dashboard. No switching between accounts.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    title: 'Delivery Platform Integration',
    desc: 'Talabat, DoorDash, Uber Eats, Swiggy, Zomato, Deliveroo -- all orders on one screen. Never miss an order, never juggle tablets.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: 'Consolidated Kitchen Display',
    desc: 'Route orders to the right station by brand or item type. Kitchen staff see exactly what to prep, organized by brand and priority.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Analytics Per Brand',
    desc: 'Track revenue, order volume, popular items, and profit margins for each brand independently. Know which brands to scale and which to tweak.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'QR Ordering for Pickup',
    desc: 'Let walk-in customers scan a QR code to order directly. Perfect for cloud kitchens with a pickup window or lobby area.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
      </svg>
    ),
  },
  {
    title: 'Inventory Across Brands',
    desc: 'Track shared ingredients across all your brands. When chicken stock runs low, every brand using it gets flagged automatically.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

const countryData = [
  {
    country: 'India',
    flag: 'IN',
    color: 'orange',
    content: 'Home to Rebel Foods (world\'s largest cloud kitchen company), Box8, Faasos, and thousands of independent cloud kitchens. Zomato and Swiggy dominate delivery. DineOpen integrates with both platforms and supports INR pricing, GST compliance, and multi-brand operations that Indian cloud kitchens need.',
  },
  {
    country: 'UAE / Dubai',
    flag: 'AE',
    color: 'emerald',
    content: 'Dubai\'s ghost kitchen licensing in 2026 has opened up massive opportunities. Talabat and Deliveroo are the dominant platforms. DineOpen supports AED pricing, VAT compliance, and integrates with both Talabat and Deliveroo for seamless order management across multiple virtual brands.',
  },
  {
    country: 'USA',
    flag: 'US',
    color: 'blue',
    content: 'DoorDash and Uber Eats dominate the US delivery market. Virtual brands have exploded, with restaurants launching delivery-only concepts. DineOpen integrates with both platforms, supports USD pricing, and makes it easy to launch and manage virtual brands alongside your main restaurant.',
  },
  {
    country: 'UK',
    flag: 'GB',
    color: 'purple',
    content: 'Deliveroo Editions pioneered the shared kitchen space concept. Just Eat and Uber Eats round out the top delivery platforms. DineOpen supports GBP pricing, VAT compliance, and integrates with all major UK delivery platforms for cloud kitchen operators.',
  },
];

const colorMap = {
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', badge: 'bg-purple-100 text-purple-700' },
};

export default function CloudKitchenPOSClient() {
  return (
    <div className="min-h-screen bg-white">
      <CommonHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-slate-700/60 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-slate-600">
            Cloud Kitchen Solutions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Best POS for <span className="text-cyan-400">Cloud Kitchens</span> &amp; <span className="text-cyan-400">Ghost Kitchens</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Run multiple brands from one kitchen. Manage Talabat, DoorDash, Uber Eats, Zomato orders on one screen. DineOpen handles the chaos so you can focus on food.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://dineopen.com/login"
              className="bg-cyan-500 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/25"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="bg-transparent text-white border-2 border-gray-500 px-8 py-4 rounded-lg text-lg font-bold hover:border-white hover:bg-white/5 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">10-30%</div>
              <div className="text-sm text-gray-500 font-medium">Cloud Kitchen Margins</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">3-8</div>
              <div className="text-sm text-gray-500 font-medium">Brands Per Kitchen</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">100-500+</div>
              <div className="text-sm text-gray-500 font-medium">Delivery Orders/Day</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center border border-gray-100">
              <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-1">$10/mo</div>
              <div className="text-sm text-gray-500 font-medium">DineOpen Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cloud Kitchens Need Different POS */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Why Cloud Kitchens Need a Different POS</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Traditional POS systems are built for dine-in restaurants. Cloud kitchens operate differently and need purpose-built tools.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Multi-Brand Management</h3>
              <p className="text-gray-600 leading-relaxed">Separate menus, pricing, and branding for each virtual brand -- all managed from one dashboard. A burger brand and a pizza brand can share a kitchen but have completely independent customer-facing identities.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Delivery Platform Aggregation</h3>
              <p className="text-gray-600 leading-relaxed">One screen for DoorDash, Uber Eats, Talabat, Zomato, Swiggy, and Deliveroo. No more juggling 5 tablets. Every order flows into a single unified queue with clear brand and platform labels.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Virtual Brand Support</h3>
              <p className="text-gray-600 leading-relaxed">Launch a new virtual brand in hours, not weeks. Create a menu, set pricing, configure branding, and start accepting orders. Test new concepts with zero additional kitchen infrastructure.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Kitchen Display Per Brand/Station</h3>
              <p className="text-gray-600 leading-relaxed">Route orders to the correct prep station based on brand or item type. Your grill station sees burger brand orders, your pizza station sees pizza brand orders. No confusion, no missed items.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DineOpen for Cloud Kitchens - Feature Grid */}
      <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">DineOpen for Cloud Kitchens</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Every feature a cloud kitchen needs, built in from day one. No add-ons, no extra charges.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-800/60 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                <div className="text-cyan-400 mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Best POS for Cloud Kitchens: Comparison</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            See how DineOpen stacks up against other POS systems for cloud kitchen operations.
          </p>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Feature</th>
                  <th className="p-4 text-center text-sm font-semibold bg-cyan-50 text-cyan-800">DineOpen</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Toast</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Square</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Foodics</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                    <td className="p-4 font-medium text-gray-900 text-sm">{row.feature}</td>
                    <td className={`p-4 text-center text-sm ${row.winner === 'dineopen' ? 'bg-cyan-50/50 text-cyan-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-gray-500 text-sm">{row.toast}</td>
                    <td className="p-4 text-center text-gray-500 text-sm">{row.square}</td>
                    <td className="p-4 text-center text-gray-500 text-sm">{row.foodics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Cloud Kitchen by Country */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Cloud Kitchens Around the World</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            DineOpen supports cloud kitchen operators in every major market with local delivery platform integrations and compliance.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {countryData.map((c) => {
              const colors = colorMap[c.color];
              return (
                <div key={c.country} className={`${colors.bg} rounded-xl p-6 border ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${colors.badge}`}>{c.flag}</span>
                    <h3 className={`font-bold text-lg ${colors.title}`}>{c.country}</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Launch Your Cloud Kitchen with DineOpen</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Start your free 30-day trial. No credit card required. No contracts. Set up multiple brands and start taking orders in minutes.
          </p>
          <Link
            href="https://dineopen.com/login"
            className="bg-cyan-500 text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-cyan-600 transition-colors inline-block shadow-lg shadow-cyan-500/25"
          >
            Start Free Trial - No Credit Card
          </Link>
          <p className="text-gray-500 mt-4 text-sm">Join cloud kitchen operators in 30+ countries using DineOpen</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Cloud Kitchen POS: Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2">What is the best POS system for a cloud kitchen?</h3>
              <p className="text-gray-600 leading-relaxed">DineOpen is the best POS for cloud kitchens because it supports multi-brand menu management, integrates with all major delivery platforms (Talabat, DoorDash, Uber Eats, Zomato, Swiggy), and provides per-brand analytics -- all for just $10/month with no contracts.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Can I run multiple brands from one POS system?</h3>
              <p className="text-gray-600 leading-relaxed">Yes, DineOpen lets you manage 3-8+ virtual brands from a single kitchen with separate menus, pricing, and branding for each. Switch between brands instantly and track performance independently.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Does DineOpen integrate with delivery apps like Uber Eats and DoorDash?</h3>
              <p className="text-gray-600 leading-relaxed">Yes, DineOpen integrates with all major delivery platforms including Uber Eats, DoorDash, Talabat, Deliveroo, Zomato, and Swiggy. All orders appear on one consolidated screen so you never miss an order.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2">How much does a cloud kitchen POS cost?</h3>
              <p className="text-gray-600 leading-relaxed">DineOpen costs just $10/month with no long-term contracts, no setup fees, and no transaction fees. Competitors like Toast charge $69+/month with additional per-transaction fees. Start with a free 30-day trial.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Can I track performance for each brand separately?</h3>
              <p className="text-gray-600 leading-relaxed">Yes, DineOpen provides real-time analytics broken down by brand, including revenue, order volume, popular items, and profit margins. This helps you identify which virtual brands are performing best and optimize your kitchen operations.</p>
            </div>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/solutions/cloud-kitchen-pos" />
      <Footer />
    </div>
  );
}
