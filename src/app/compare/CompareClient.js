'use client';

import Link from 'next/link';

const competitors = [
  {
    name: 'DineOpen',
    logo: '/favicon.png',
    price: '$10/mo',
    priceINR: '₹999/mo',
    transactionFee: '0%',
    aiFeatures: true,
    voiceOrdering: true,
    qrOrdering: true,
    multiLocation: 'Unlimited',
    freeTrial: '7 days',
    gstBilling: true,
    highlight: true,
  },
  {
    name: 'Square',
    logo: '/competitors/square.svg',
    price: '$60/mo',
    priceINR: '₹5,000/mo',
    transactionFee: '2.6% + 10¢',
    aiFeatures: false,
    voiceOrdering: false,
    qrOrdering: true,
    multiLocation: 'Extra cost',
    freeTrial: '30 days',
    gstBilling: false,
  },
  {
    name: 'Toast',
    logo: '/competitors/toast.svg',
    price: '$69/mo',
    priceINR: 'N/A in India',
    transactionFee: '2.49% + 15¢',
    aiFeatures: false,
    voiceOrdering: false,
    qrOrdering: true,
    multiLocation: 'Extra cost',
    freeTrial: 'Demo only',
    gstBilling: false,
  },
  {
    name: 'Petpooja',
    logo: '/competitors/petpooja.svg',
    price: 'N/A',
    priceINR: '₹1,999/mo',
    transactionFee: '1.5-2%',
    aiFeatures: false,
    voiceOrdering: false,
    qrOrdering: true,
    multiLocation: 'Extra cost',
    freeTrial: '14 days',
    gstBilling: true,
  },
];

const features = [
  { key: 'price', label: 'Monthly Price (USD)', showINR: false },
  { key: 'priceINR', label: 'Monthly Price (INR)', showINR: true },
  { key: 'transactionFee', label: 'Transaction Fee' },
  { key: 'aiFeatures', label: 'AI Features', boolean: true },
  { key: 'voiceOrdering', label: 'Voice Ordering', boolean: true },
  { key: 'qrOrdering', label: 'QR Code Ordering', boolean: true },
  { key: 'multiLocation', label: 'Multi-Location Support' },
  { key: 'freeTrial', label: 'Free Trial' },
  { key: 'gstBilling', label: 'GST Billing (India)', boolean: true },
];

export default function CompareClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Compare Restaurant POS Systems
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find the best POS system for your restaurant. Compare DineOpen with Square, Toast, and Petpooja on pricing, features, and transaction fees.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/alternatives/square" className="text-blue-600 hover:underline">
              Square Alternative →
            </Link>
            <Link href="/alternatives/toast" className="text-blue-600 hover:underline">
              Toast Alternative →
            </Link>
            <Link href="/alternatives/petpooja" className="text-blue-600 hover:underline">
              Petpooja Alternative →
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl shadow-lg">
            <thead>
              <tr>
                <th className="p-4 text-left bg-gray-100 rounded-tl-xl">Features</th>
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`p-4 text-center ${comp.highlight ? 'bg-green-100' : 'bg-gray-100'} ${comp.name === 'Petpooja' ? 'rounded-tr-xl' : ''}`}
                  >
                    <div className="font-bold text-lg">{comp.name}</div>
                    {comp.highlight && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 font-medium text-gray-700">{feature.label}</td>
                  {competitors.map((comp) => (
                    <td
                      key={comp.name}
                      className={`p-4 text-center ${comp.highlight ? 'bg-green-50' : ''}`}
                    >
                      {feature.boolean ? (
                        comp[feature.key] ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-red-500 text-xl">✗</span>
                        )
                      ) : (
                        <span className={comp.highlight && feature.key.includes('Fee') && comp[feature.key] === '0%' ? 'text-green-600 font-bold' : ''}>
                          {comp[feature.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why Choose DineOpen */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose DineOpen?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-xl mb-2">Zero Transaction Fees</h3>
              <p className="text-gray-600">Save thousands annually with 0% transaction fees unlike Square (2.6%) or Toast (2.49%).</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold text-xl mb-2">AI Voice Ordering</h3>
              <p className="text-gray-600">Only POS with AI that takes orders via voice. Reduce staff workload, increase efficiency.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold text-xl mb-2">Global + Local</h3>
              <p className="text-gray-600">Works worldwide with GST billing for India, multi-currency support for US/UK.</p>
            </div>
          </div>
          <div className="mt-12">
            <Link
              href="https://dineopen.com/login"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-green-700 transition-colors"
            >
              Start Free 7-Day Trial →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Schema for SEO */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-2">What is the best restaurant POS system in 2026?</h3>
              <p className="text-gray-600">DineOpen is rated the best value restaurant POS with AI features, zero transaction fees, and affordable pricing starting at $10/month.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-2">Which POS system has the lowest fees?</h3>
              <p className="text-gray-600">DineOpen has 0% transaction fees. Square charges 2.6% + 10¢, Toast charges 2.49% + 15¢, and Petpooja charges 1.5-2%.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-2">Is there a free restaurant POS system?</h3>
              <p className="text-gray-600">DineOpen offers a free 7-day trial with all features. After that, plans start at just $10/month with no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
