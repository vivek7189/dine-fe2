'use client';

import Link from 'next/link';
import InternalLinks from '../../../components/InternalLinks';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: 'AED 149/mo', foodics: 'AED 300+/mo', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', foodics: '1-2%', winner: 'dineopen' },
  { feature: 'Arabic/English Support', dineopen: '\u2713', foodics: '\u2713', winner: 'tie' },
  { feature: 'Talabat Integration', dineopen: '\u2713', foodics: '\u2713', winner: 'tie' },
  { feature: 'Deliveroo Integration', dineopen: '\u2713', foodics: '\u2713', winner: 'tie' },
  { feature: 'AI Voice Ordering', dineopen: '\u2713', foodics: '\u2717', winner: 'dineopen' },
  { feature: 'VAT 5% Compliant', dineopen: '\u2713', foodics: '\u2713', winner: 'tie' },
  { feature: 'Hardware Required', dineopen: 'No (any device)', foodics: 'Foodics hardware', winner: 'dineopen' },
  { feature: 'Contract Length', dineopen: 'Month-to-month', foodics: 'Annual', winner: 'dineopen' },
  { feature: 'Free Trial', dineopen: '30 days', foodics: 'Demo only', winner: 'dineopen' },
  { feature: 'QR Ordering', dineopen: 'Included', foodics: 'Extra cost', winner: 'dineopen' },
  { feature: 'Multi-location', dineopen: '\u2713', foodics: '\u2713 (extra)', winner: 'dineopen' },
];

export default function FoodicsAlternativeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <CommonHeader />

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            #1 Foodics Alternative in UAE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Looking for a <span className="text-teal-200">Foodics Alternative</span>?
          </h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            DineOpen offers everything Foodics does at half the price. AED 149/mo vs AED 300+/mo. Zero transaction fees. No long contracts. Arabic + English support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://dineopen.com/login"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-teal-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="#comparison"
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition-colors"
            >
              See Full Comparison
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-12 px-4 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Common Foodics Frustrations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">Expensive Pricing</h3>
              <p className="text-gray-600">AED 300+/month base price, plus extra charges for add-ons like QR ordering, multi-location, and advanced reporting.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">Complex Setup</h3>
              <p className="text-gray-600">Requires professional installation and Foodics-specific hardware. Getting started takes days, not hours.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">High Transaction Fees</h3>
              <p className="text-gray-600">1-2% transaction fees on every order eat into your margins. On AED 50,000/month revenue, that is AED 500-1,000 lost.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">Long-Term Contracts</h3>
              <p className="text-gray-600">Annual contracts lock you in even if the system does not fit your needs. Early termination fees apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen vs Foodics: Feature Comparison</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center bg-green-100">DineOpen</th>
                  <th className="p-4 text-center">Foodics</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className={`p-4 text-center ${row.winner === 'dineopen' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-gray-600">{row.foodics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-16 px-4 bg-teal-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Annual Savings Calculator</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Foodics Cost</div>
              <div className="text-3xl font-bold text-red-600 mb-2">AED 7,200</div>
              <div className="text-gray-500 text-sm">AED 300/mo x 12 = AED 3,600</div>
              <div className="text-gray-500 text-sm">+ transaction fees ~AED 3,600</div>
              <div className="text-gray-400 text-xs mt-1">Based on AED 25,000/mo revenue</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">DineOpen Cost</div>
              <div className="text-3xl font-bold text-green-600 mb-2">AED 1,788</div>
              <div className="text-gray-500 text-sm">AED 149/mo x 12 = AED 1,788</div>
              <div className="text-gray-500 text-sm">+ zero transaction fees</div>
              <div className="text-gray-400 text-xs mt-1">Everything included</div>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 rounded-xl shadow-md text-center text-white">
              <div className="text-sm font-medium text-teal-100 uppercase tracking-wide mb-2">You Save</div>
              <div className="text-4xl font-bold mb-2">AED 5,412</div>
              <div className="text-teal-100 text-sm">per year</div>
              <div className="text-teal-200 text-xs mt-1">That is AED 451 back in your pocket every month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why UAE Restaurants Switch */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why UAE Restaurants Switch to DineOpen</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-teal-600 mb-4">50%</div>
              <h3 className="font-bold text-xl mb-2">Lower Cost</h3>
              <p className="text-gray-600">AED 149/mo vs AED 300+/mo. Zero transaction fees. No hidden charges. No expensive hardware to buy.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">AI</div>
              <h3 className="font-bold text-xl mb-2">AI-Powered Features</h3>
              <p className="text-gray-600">AI voice ordering, AI menu extraction, and smart analytics that Foodics simply does not offer.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">BYOD</div>
              <h3 className="font-bold text-xl mb-2">No Hardware Lock-in</h3>
              <p className="text-gray-600">Use any phone, tablet, or laptop. No need to buy or lease Foodics-specific terminals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Guide */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Migrate from Foodics in 3 Easy Steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold text-lg mb-2">Sign Up Free</h3>
              <p className="text-gray-600">Create your DineOpen account in 2 minutes. No credit card required. 30-day free trial.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold text-lg mb-2">Import Your Menu</h3>
              <p className="text-gray-600">Use AI-powered menu extraction. Upload a photo or PDF of your menu and DineOpen builds it automatically.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold text-lg mb-2">Go Live in 24 Hours</h3>
              <p className="text-gray-600">Start taking orders on any device. No professional installation needed. Our team helps you every step.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Switch from Foodics Today</h2>
          <p className="text-xl text-teal-100 mb-8">Start your free 30-day trial. No credit card required. No contracts. Import your menu in minutes.</p>
          <Link
            href="https://dineopen.com/login"
            className="bg-white text-teal-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-teal-50 transition-colors inline-block"
          >
            Start Free Trial - No Credit Card
          </Link>
          <p className="text-teal-200 mt-4">Join UAE restaurants that already switched from Foodics to DineOpen</p>
        </div>
      </section>

      <InternalLinks currentPath="/alternatives/foodics" variant="alternative" />
      <Footer />
    </div>
  );
}
