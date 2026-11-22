'use client';

import Link from 'next/link';
import InternalLinks from '../../../components/InternalLinks';

// Toast figures from Toast's own pricing and support pages (checked 22 Nov 2026); see SOURCES below.
// DineOpen figures must match src/app/pricing/PricingClient.js (USD: Starter $20, Growth $50).
const TOAST_PLANS = [
  { plan: 'Starter Kit', monthly: '$0', card: 'Higher rate than Point of Sale (see Toast quote)', note: '1–2 terminals, single location' },
  { plan: 'Point of Sale', monthly: '$69', card: '2.49% + 15¢ in person', note: 'Most restaurants' },
  { plan: 'Build Your Own', monthly: 'Quote', card: 'Quote', note: 'Larger or multi-site' },
];

const comparisonData = [
  { feature: 'Software, per month', dineopen: 'Starter $20 · Growth $50', toast: '$0 (Starter Kit) or $69 (Point of Sale)' },
  { feature: 'Charge on your card payments', dineopen: 'None (use your own processor)', toast: 'Toast Payments required; 2.49% + 15¢ in person on Point of Sale' },
  { feature: 'Hardware', dineopen: 'Phones, tablets, PCs you already own', toast: 'Toast hardware' },
  { feature: 'Contract', dineopen: 'Month to month, cancel any time', toast: 'Depends on plan and quote' },
  { feature: 'Free trial', dineopen: '7 days, self sign-up', toast: 'Sales demo / quote' },
  { feature: 'QR menu & QR ordering', dineopen: 'Included (Starter)', toast: 'Available' },
  { feature: 'Kitchen display (KDS)', dineopen: 'Growth plan', toast: 'Available' },
  { feature: 'Online ordering website', dineopen: 'Growth plan', toast: 'Available' },
  { feature: 'AI voice ordering', dineopen: 'Growth plan', toast: 'Check with Toast' },
  { feature: 'Countries', dineopen: 'Worldwide, local tax and prices', toast: 'US, Canada, UK, Ireland, Australia' },
];

const SOURCES = [
  { label: 'Toast pricing plans', href: 'https://pos.toasttab.com/shop/pricing-plan' },
  { label: 'Toast Starter Kit', href: 'https://pos.toasttab.com/shop/starter-kit' },
  { label: 'Toast product availability in Australia, Canada, Ireland and the UK', href: 'https://support.toasttab.com/en/article/Toast-Product-Availability-in-Australia-Canada-Ireland-and-the-United-Kingdom' },
  { label: 'DineOpen pricing', href: '/pricing' },
];

const cell = 'p-3 md:p-4 border-b border-gray-100 align-top';

export default function ToastAlternativeClient({ faqs = [] }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            Toast pricing &amp; alternative · Updated 22 Nov 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Toast POS pricing 2026, and a <span className="text-orange-600">cheaper alternative</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            What Toast actually costs once you add card fees and hardware, and how DineOpen compares for restaurants in the US, Canada, the UK, Ireland, Australia and beyond.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login?utm_source=dineopen&utm_medium=alternatives&utm_campaign=toast"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors"
            >
              Start 7-day free trial →
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-50 transition-colors"
            >
              See DineOpen pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Quick answer */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 text-amber-900 leading-relaxed">
          <strong>Quick answer:</strong> Toast has a <strong>$0/month Starter Kit</strong> (higher card rate) and a{' '}
          <strong>$69/month Point of Sale</strong> plan, where in-person card payments cost <strong>2.49% + 15¢</strong>. You must
          use Toast Payments and Toast hardware. DineOpen is <strong>$20/month</strong> (Starter) or <strong>$50/month</strong>{' '}
          (Growth, with KDS, online ordering and AI voice ordering), runs on devices you already own, adds nothing to your card
          payments, and has no contract.
        </div>
      </section>

      {/* Toast plans */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">How much does Toast cost?</h2>
          <p className="text-gray-600 text-center mb-8">Software is only one of three costs. Add card processing and hardware to get the real bill.</p>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-left min-w-[560px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 md:p-4">Toast plan</th>
                  <th className="p-3 md:p-4">Software / month</th>
                  <th className="p-3 md:p-4">Card payments</th>
                  <th className="p-3 md:p-4">For</th>
                </tr>
              </thead>
              <tbody>
                {TOAST_PLANS.map((r) => (
                  <tr key={r.plan}>
                    <td className={`${cell} font-medium`}>{r.plan}</td>
                    <td className={cell}>{r.monthly}</td>
                    <td className={cell}>{r.card}</td>
                    <td className={`${cell} text-gray-600`}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-3">Worked example: software only</h3>
          <p className="text-gray-700 leading-relaxed">
            Toast Point of Sale at $69/month is <strong>$828 a year</strong> per location. DineOpen Starter at $20/month is{' '}
            <strong>$240 a year</strong>, and Growth at $50/month is <strong>$600 a year</strong>. Card fees come on top with
            either system: with Toast they are set by Toast Payments; with DineOpen you keep whichever processor gives you the best
            rate, and DineOpen adds nothing to it.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-14 px-4 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen vs Toast, side by side</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-left min-w-[560px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 md:p-4">&nbsp;</th>
                  <th className="p-3 md:p-4 bg-green-100">DineOpen</th>
                  <th className="p-3 md:p-4">Toast</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.feature}>
                    <td className={`${cell} font-medium`}>{row.feature}</td>
                    <td className={`${cell} text-green-800`}>{row.dineopen}</td>
                    <td className={`${cell} text-gray-600`}>{row.toast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Toast is a strong platform, especially if you want one company for payments, hardware, payroll and lending. DineOpen
            suits owners who want lower fixed costs, their own card processor and devices, and no contract.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Questions owners ask</h2>
          {faqs.map((f) => (
            <div key={f.q} className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{f.q}</h3>
              <p className="text-gray-700 leading-relaxed">{f.a}</p>
            </div>
          ))}
          <div className="mt-8 text-sm text-gray-500">
            <strong>Sources</strong> (checked 22 Nov 2026; prices change, confirm with Toast before you sign):
            <ul className="list-disc pl-5 mt-2">
              {SOURCES.map((s) => (
                <li key={s.href}>
                  {s.href.startsWith('/') ? <Link href={s.href} className="underline">{s.label}</Link> : (
                    <a href={s.href} target="_blank" rel="nofollow noopener noreferrer" className="underline">{s.label}</a>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              More: <Link href="/blog/how-much-does-toast-pos-cost-2026" className="underline">How much does Toast cost? (full breakdown)</Link>
              {' · '}<Link href="/blog/square-vs-toast-vs-clover-2026" className="underline">Square vs Toast vs Clover</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-orange-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Try DineOpen before you sign anything</h2>
          <p className="text-xl text-gray-600 mb-8">7-day free trial, no contract. Set up your menu in minutes on the devices you have.</p>
          <Link
            href="/login?utm_source=dineopen&utm_medium=alternatives&utm_campaign=toast"
            className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors inline-block"
          >
            Start free trial →
          </Link>
        </div>
      </section>
      <InternalLinks currentPath="/alternatives/toast" variant="alternative" />
    </div>
  );
}
