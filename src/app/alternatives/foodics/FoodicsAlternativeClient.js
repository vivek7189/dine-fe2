'use client';

import Link from 'next/link';
import InternalLinks from '../../../components/InternalLinks';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { ROWS, FAQS } from './content';

const TRIAL = '/login?utm_source=alternatives&utm_medium=cta&utm_campaign=foodics';

export default function FoodicsAlternativeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <CommonHeader />

      <section className="py-16 px-4 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Looking for a Foodics alternative in the UAE?</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            DineOpen starts at AED 75 a month, takes Talabat orders in automatically and you can try it for 7 days before talking to anyone. Foodics is the bigger name with more local depth. Here is an honest look at when each one fits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={TRIAL} className="bg-white text-teal-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-teal-50 transition-colors">
              Start free trial
            </Link>
            <a href="#comparison" className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition-colors">
              See the comparison
            </a>
          </div>
          <p className="mt-6 text-teal-100">
            Want the plan-by-plan detail, including Saudi ZATCA?{' '}
            <Link href="/vs/dineopen-vs-foodics" className="underline text-white font-semibold">Read DineOpen vs Foodics</Link>
          </p>
        </div>
      </section>

      <section id="comparison" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">DineOpen and Foodics, side by side</h2>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4">What you are checking</th>
                  <th className="p-4">DineOpen</th>
                  <th className="p-4">Foodics</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, d, f]) => (
                  <tr key={label} className="border-b border-gray-100">
                    <td className="p-4 font-semibold text-gray-900">{label}</td>
                    <td className="p-4 text-gray-700">{d}</td>
                    <td className="p-4 text-gray-700">{f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Foodics prices as listed on foodics.com for the UAE in October 2026. Plans include different features, so compare what you need. Sources are listed on our <Link href="/vs/dineopen-vs-foodics" className="underline">DineOpen vs Foodics</Link> page.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-teal-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold text-xl mb-3 text-gray-900">When Foodics is the better pick</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Your restaurant is in Saudi Arabia and needs ZATCA e-invoicing.</li>
              <li>You want payments and settlement from the same company (Foodics Pay).</li>
              <li>You rely on Deliveroo, Noon or Careem orders flowing in automatically.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold text-xl mb-3 text-gray-900">When DineOpen is the better pick</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>You run a café or restaurant in the UAE and want to start from AED 75 a month.</li>
              <li>Talabat is a big part of your orders.</li>
              <li>You want staff attendance and payroll in the same app.</li>
              <li>You want to try everything for 7 days before paying.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions owners ask us</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{f.q}</h3>
                <p className="text-gray-700">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try DineOpen free for 7 days</h2>
          <p className="text-teal-100 mb-8">No card needed. Send us your menu on WhatsApp and we will help you set it up.</p>
          <Link href={TRIAL} className="inline-block bg-white text-teal-700 px-10 py-4 rounded-lg text-lg font-bold hover:bg-teal-50 transition-colors">
            Start free trial
          </Link>
        </div>
      </section>

      <InternalLinks currentPath="/alternatives/foodics" variant="alternative" />
      <Footer />
    </div>
  );
}
