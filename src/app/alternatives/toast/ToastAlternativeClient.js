'use client';

import Link from 'next/link';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', toast: '$69+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', toast: '2.49% + 15¢', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', toast: '✗', winner: 'dineopen' },
  { feature: 'Hardware Lock-in', dineopen: 'None', toast: 'Toast hardware only', winner: 'dineopen' },
  { feature: 'Contract Length', dineopen: 'Month-to-month', toast: '2-year commitment', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓', toast: '✓', winner: 'tie' },
  { feature: 'Online Ordering', dineopen: '✓ (included)', toast: '✓ (extra cost)', winner: 'dineopen' },
  { feature: 'Kitchen Display (KDS)', dineopen: '✓', toast: '✓', winner: 'tie' },
  { feature: 'Free Trial', dineopen: '30 days', toast: 'Demo only', winner: 'dineopen' },
  { feature: 'Global Availability', dineopen: 'US, UK, India & more', toast: 'US only', winner: 'dineopen' },
];

export default function ToastAlternativeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            #1 Toast Alternative for Restaurants
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Looking for a <span className="text-orange-600">Toast Alternative</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            DineOpen offers everything Toast does plus AI voice ordering, zero transaction fees, no hardware lock-in, and month-to-month billing. Save $7,000+ per year.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://dineopen.com/login"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/compare"
              className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-50 transition-colors"
            >
              See Full Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-12 px-4 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Common Toast Frustrations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">😤 Hardware Lock-in</h3>
              <p className="text-gray-600">Toast requires proprietary hardware. With DineOpen, use any device - phones, tablets, computers.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">📝 Long Contracts</h3>
              <p className="text-gray-600">Toast locks you into 2-year contracts. DineOpen is month-to-month. Cancel anytime.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">💰 High Transaction Fees</h3>
              <p className="text-gray-600">Toast charges 2.49% + 15¢ per transaction. DineOpen charges 0%.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">🌍 US Only</h3>
              <p className="text-gray-600">Toast only works in the US. DineOpen works globally - US, UK, India, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen vs Toast: Feature Comparison</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center bg-green-100">DineOpen</th>
                  <th className="p-4 text-center">Toast</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className={`p-4 text-center ${row.winner === 'dineopen' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-gray-600">{row.toast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Restaurants Switch from Toast to DineOpen</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🆓</div>
              <h3 className="font-bold text-xl mb-2">No Contract Lock-in</h3>
              <p className="text-gray-600">Month-to-month billing. No 2-year commitments. Leave anytime if you&apos;re not happy.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="font-bold text-xl mb-2">AI Voice Ordering</h3>
              <p className="text-gray-600">Revolutionary AI that takes orders via voice. Toast doesn&apos;t have this technology.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-bold text-xl mb-2">Use Any Device</h3>
              <p className="text-gray-600">Works on any phone, tablet, or computer. No expensive Toast hardware required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Switch from Toast?</h2>
          <p className="text-xl text-gray-600 mb-8">Start your free 30-day trial. No credit card required. No contracts. Import your menu in minutes.</p>
          <Link
            href="https://dineopen.com/login"
            className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors inline-block"
          >
            Start Free Trial - No Credit Card →
          </Link>
          <p className="text-gray-500 mt-4">Join 500+ restaurants that switched from Toast to DineOpen</p>
        </div>
      </section>
    </div>
  );
}
