'use client';

import Link from 'next/link';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', square: '$60+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', square: '2.6% + 10¢', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', square: '✗', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓', square: '✓', winner: 'tie' },
  { feature: 'Multi-Location', dineopen: 'Unlimited (included)', square: 'Extra cost', winner: 'dineopen' },
  { feature: 'Kitchen Display (KDS)', dineopen: '✓', square: '✓ (extra cost)', winner: 'dineopen' },
  { feature: 'GST Billing (India)', dineopen: '✓', square: '✗', winner: 'dineopen' },
  { feature: 'Free Trial', dineopen: '30 days', square: '30 days', winner: 'tie' },
  { feature: 'Hardware Required', dineopen: 'No (works on any device)', square: 'Square hardware', winner: 'dineopen' },
];

export default function SquareAlternativeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            #1 Square Alternative for Restaurants
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Looking for a <span className="text-blue-600">Square Alternative</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            DineOpen gives you everything Square offers plus AI voice ordering, zero transaction fees, and unlimited multi-location support. Save $5,000+ per year.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://dineopen.com/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/compare"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition-colors"
            >
              See Full Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-12 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Potential Savings</h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">Based on $20,000/month in card transactions:</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-gray-500">With Square (2.6% + $0.10)</p>
                <p className="text-3xl font-bold text-red-600">-$6,240/year</p>
                <p className="text-sm text-gray-500">in transaction fees</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">With DineOpen (0%)</p>
                <p className="text-3xl font-bold text-green-600">$0/year</p>
                <p className="text-sm text-gray-500">in transaction fees</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <p className="text-2xl font-bold text-green-700">Save $6,240+ per year!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen vs Square: Feature Comparison</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center bg-green-100">DineOpen</th>
                  <th className="p-4 text-center">Square</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className={`p-4 text-center ${row.winner === 'dineopen' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-gray-600">{row.square}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Restaurants Switch from Square to DineOpen</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="font-bold text-xl mb-2">Eliminate Transaction Fees</h3>
              <p className="text-gray-600">Square charges 2.6% + 10¢ per transaction. DineOpen charges 0%. Keep more of your revenue.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="font-bold text-xl mb-2">AI Voice Ordering</h3>
              <p className="text-gray-600">Take orders hands-free with AI. Square doesn&apos;t offer this. Reduce errors, speed up service.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-bold text-xl mb-2">No Special Hardware</h3>
              <p className="text-gray-600">Works on any phone, tablet, or computer. No need to buy expensive Square terminals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Switch from Square?</h2>
          <p className="text-xl text-gray-600 mb-8">Start your free 30-day trial. No credit card required. Import your menu in minutes.</p>
          <Link
            href="https://dineopen.com/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors inline-block"
          >
            Start Free Trial - No Credit Card →
          </Link>
          <p className="text-gray-500 mt-4">Join 500+ restaurants that switched from Square to DineOpen</p>
        </div>
      </section>
    </div>
  );
}
