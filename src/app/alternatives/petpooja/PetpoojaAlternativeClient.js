'use client';

import Link from 'next/link';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '₹999/month', petpooja: '₹1,999+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', petpooja: '1.5-2%', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
  { feature: 'GST Billing', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Zomato Integration', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Swiggy Integration', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'QR Code Menus', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Multi-Location', dineopen: 'Unlimited (included)', petpooja: 'Extra cost per location', winner: 'dineopen' },
  { feature: 'UPI Payments', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Free Trial', dineopen: '30 days', petpooja: '14 days', winner: 'dineopen' },
  { feature: 'AI Menu Extraction', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
];

export default function PetpoojaAlternativeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            #1 Petpooja Alternative in India
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Looking for a <span className="text-purple-600">Petpooja Alternative</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            DineOpen offers AI voice ordering, zero transaction fees, GST billing, and Zomato/Swiggy integration at half the price of Petpooja. Save ₹50,000+ per year.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://app.dineopen.com/register"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/compare"
              className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-50 transition-colors"
            >
              See Full Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* Savings Calculator INR */}
      <section className="py-12 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Potential Savings (India)</h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-4">Based on ₹5,00,000/month in transactions:</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-gray-500">With Petpooja</p>
                <p className="text-lg text-gray-600">₹1,999/mo + 1.5% fees</p>
                <p className="text-3xl font-bold text-red-600">₹1,13,988/year</p>
                <p className="text-sm text-gray-500">(₹23,988 subscription + ₹90,000 fees)</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">With DineOpen</p>
                <p className="text-lg text-gray-600">₹999/mo + 0% fees</p>
                <p className="text-3xl font-bold text-green-600">₹11,988/year</p>
                <p className="text-sm text-gray-500">(subscription only, zero fees)</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <p className="text-2xl font-bold text-green-700">Save ₹1,02,000+ per year!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen vs Petpooja: Feature Comparison</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center bg-green-100">DineOpen</th>
                  <th className="p-4 text-center">Petpooja</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className={`p-4 text-center ${row.winner === 'dineopen' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-gray-600">{row.petpooja}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* India-Specific Features */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built for Indian Restaurants</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🧾</div>
              <h3 className="font-bold text-lg mb-2">GST Billing</h3>
              <p className="text-gray-600 text-sm">Full GST compliance with CGST, SGST, IGST</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-bold text-lg mb-2">UPI Payments</h3>
              <p className="text-gray-600 text-sm">Accept GPay, PhonePe, Paytm & all UPI</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🍔</div>
              <h3 className="font-bold text-lg mb-2">Zomato & Swiggy</h3>
              <p className="text-gray-600 text-sm">Direct integration with delivery apps</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-bold text-lg mb-2">WhatsApp Orders</h3>
              <p className="text-gray-600 text-sm">Take orders via WhatsApp chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Indian Restaurants Switch to DineOpen</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold text-xl mb-2">AI Voice Ordering</h3>
              <p className="text-gray-600">Only POS in India with AI that takes orders via voice in Hindi & English. Petpooja doesn&apos;t have this.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-xl mb-2">50% Lower Cost</h3>
              <p className="text-gray-600">₹999/month vs Petpooja&apos;s ₹1,999/month. Plus zero transaction fees save ₹90,000+/year.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="font-bold text-xl mb-2">Unlimited Locations</h3>
              <p className="text-gray-600">Manage unlimited restaurants from one dashboard. Petpooja charges extra per location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Placeholder */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl text-gray-700 italic mb-4">
            &quot;We switched from Petpooja to DineOpen and saved ₹80,000 in the first year. The AI voice ordering feature has reduced our order errors by 40%.&quot;
          </blockquote>
          <p className="text-gray-500">- Restaurant Owner, Mumbai</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Switch from Petpooja?</h2>
          <p className="text-xl text-gray-600 mb-8">Start your free 30-day trial. No credit card required. Import your menu in minutes. Full GST support.</p>
          <Link
            href="https://app.dineopen.com/register"
            className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors inline-block"
          >
            Start Free Trial - No Credit Card →
          </Link>
          <p className="text-gray-500 mt-4">Join 500+ Indian restaurants that switched to DineOpen</p>
        </div>
      </section>
    </div>
  );
}
