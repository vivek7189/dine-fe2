'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$9.99/month', restroworks: '$100-300/month', winner: 'dineopen' },
  { feature: 'Setup / Implementation Fee', dineopen: '$0', restroworks: '$1,000-5,000', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', restroworks: 'Varies by integration', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '\u2713', restroworks: '\u2717', winner: 'dineopen' },
  { feature: 'AI Menu Extraction', dineopen: '\u2713', restroworks: '\u2717', winner: 'dineopen' },
  { feature: 'Self-Serve Onboarding', dineopen: '\u2713 Instant', restroworks: '\u2717 IT team needed', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '\u2713 Included', restroworks: '\u2713 Included', winner: 'tie' },
  { feature: 'Kitchen Display (KDS)', dineopen: '\u2713 Included', restroworks: '\u2713 Included', winner: 'tie' },
  { feature: 'Multi-Location Support', dineopen: '\u2713 Transparent pricing', restroworks: '\u2713 Custom pricing', winner: 'dineopen' },
  { feature: 'Delivery Integration', dineopen: '\u2713 Built-in', restroworks: '\u2713 Available', winner: 'tie' },
  { feature: 'Contract Length', dineopen: 'Month-to-month', restroworks: 'Annual contract', winner: 'dineopen' },
  { feature: 'Free Trial', dineopen: '30 days', restroworks: 'Demo only', winner: 'dineopen' },
];

const pricingScenarios = [
  {
    type: 'Small Restaurant',
    subtitle: '1 location, 1 terminal',
    dineopen: { monthly: '$9.99', annual: '$120', setup: '$0', total: '$120/yr' },
    restroworks: { monthly: '$150', annual: '$1,800', setup: '$2,000', total: '$3,800/yr' },
    savings: '$3,680',
  },
  {
    type: 'Medium Restaurant',
    subtitle: '1 location, 3 terminals',
    dineopen: { monthly: '$29.99', annual: '$360', setup: '$0', total: '$360/yr' },
    restroworks: { monthly: '$300', annual: '$3,600', setup: '$3,000', total: '$6,600/yr' },
    savings: '$6,240',
  },
  {
    type: 'Chain Restaurant',
    subtitle: '5 locations',
    dineopen: { monthly: '$99.99', annual: '$1,200', setup: '$0', total: '$1,200/yr' },
    restroworks: { monthly: '$750', annual: '$9,000', setup: '$5,000', total: '$14,000/yr' },
    savings: '$12,800',
  },
];

export default function RestroworksAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section - Purple Gradient */}
        <section className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium mb-6">
              #1 Restroworks Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Looking for a <span className="text-yellow-300">Restroworks Alternative</span>?
            </h1>
            <p className="text-xl opacity-95 max-w-3xl mx-auto mb-8">
              DineOpen offers enterprise features at SMB prices. AI-powered POS with zero transaction fees. Perfect for single to multi-location restaurants.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="https://dineopen.com/login"
                className="bg-white text-purple-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-50 transition-colors"
              >
                Start Free Trial &rarr;
              </Link>
              <Link
                href="/compare"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition-colors"
              >
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 px-4 bg-red-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Common Restroworks Frustrations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <h3 className="font-bold text-lg mb-2">Enterprise Pricing for Small Restaurants</h3>
                <p className="text-gray-600">
                  Restroworks is built for large chains and charges enterprise rates. Small and mid-size restaurants end up overpaying for features they don&apos;t need. DineOpen starts at just $9.99/month.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <h3 className="font-bold text-lg mb-2">Complex Setup Requiring IT Team</h3>
                <p className="text-gray-600">
                  Restroworks needs dedicated implementation teams and weeks of setup. DineOpen offers instant self-serve onboarding &mdash; upload your menu and start in minutes.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <h3 className="font-bold text-lg mb-2">Limited AI Capabilities</h3>
                <p className="text-gray-600">
                  Restroworks focuses on traditional POS features with limited AI. DineOpen includes AI voice ordering, AI chat assistant, and AI-powered menu extraction.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <h3 className="font-bold text-lg mb-2">Outdated UI/UX</h3>
                <p className="text-gray-600">
                  Restroworks&apos; interface feels dated and requires training. DineOpen&apos;s modern, intuitive design means your staff can start using it with zero training.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              DineOpen vs Restroworks: Feature Comparison
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left font-semibold">Feature</th>
                      <th className="p-4 text-center bg-purple-100 font-semibold">DineOpen</th>
                      <th className="p-4 text-center font-semibold">Restroworks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, idx) => (
                      <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className={`p-4 text-center ${row.winner === 'dineopen' ? 'bg-purple-50 text-purple-700 font-bold' : ''}`}>
                          {row.dineopen}
                        </td>
                        <td className="p-4 text-center text-gray-600">{row.restroworks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="py-16 px-4 bg-purple-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Pricing Comparison: DineOpen vs Restroworks
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              See how much you can save by switching from Restroworks to DineOpen across different restaurant sizes.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingScenarios.map((scenario) => (
                <div key={scenario.type} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-purple-700 text-white p-5 text-center">
                    <h3 className="text-xl font-bold">{scenario.type}</h3>
                    <p className="text-purple-200 text-sm mt-1">{scenario.subtitle}</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Restroworks (1st year)</p>
                      <p className="text-2xl font-bold text-red-600">{scenario.restroworks.total}</p>
                      <p className="text-xs text-gray-400">{scenario.restroworks.setup} setup + {scenario.restroworks.monthly}/mo</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">DineOpen (1st year)</p>
                      <p className="text-2xl font-bold text-green-600">{scenario.dineopen.total}</p>
                      <p className="text-xs text-gray-400">{scenario.dineopen.setup} setup + {scenario.dineopen.monthly}/mo</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-green-700">You save</p>
                      <p className="text-xl font-extrabold text-green-700">{scenario.savings}/year</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Restaurants Switch */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Why Restaurants Switch from Restroworks to DineOpen
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">$</span>
                </div>
                <h3 className="font-bold text-xl mb-3">80% Lower Cost</h3>
                <p className="text-gray-600 leading-relaxed">
                  Restroworks charges enterprise rates with custom quotes, setup fees, and annual contracts. DineOpen is $9.99/month with transparent pricing and zero hidden costs.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">AI</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Built-in AI Features</h3>
                <p className="text-gray-600 leading-relaxed">
                  DineOpen includes AI voice ordering, AI chat assistant for staff, and AI-powered menu extraction from photos. Restroworks has limited AI, mostly basic analytics.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">&lt;5m</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Setup in 5 Minutes</h3>
                <p className="text-gray-600 leading-relaxed">
                  No IT team needed. Sign up, upload your menu via photo or spreadsheet, and start taking orders. Restroworks requires weeks of implementation and dedicated support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-700 to-purple-900 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Switch from Restroworks?
            </h2>
            <p className="text-xl opacity-95 mb-8">
              Start your free 30-day trial. No credit card required. No setup fees. No annual contracts.
            </p>
            <Link
              href="https://dineopen.com/login"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-purple-50 transition-colors inline-block"
            >
              Start Free Trial - No Credit Card &rarr;
            </Link>
            <p className="text-purple-200 mt-4">Join restaurants that switched from Restroworks to DineOpen</p>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/alternatives/restroworks" variant="alternative" />
      <Footer />
    </>
  );
}
