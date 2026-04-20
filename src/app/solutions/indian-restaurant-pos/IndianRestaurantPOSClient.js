'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Spice Level Customization', dineopen: 'Built-in (4 levels)', generic: 'Manual workaround', winner: 'dineopen' },
  { feature: 'Thali/Combo Builder', dineopen: 'Native combo system', generic: 'Not supported', winner: 'dineopen' },
  { feature: 'Gravy vs Dry Selection', dineopen: 'Per-item toggle', generic: 'Not available', winner: 'dineopen' },
  { feature: 'Naan/Roti Modifiers', dineopen: 'Pre-built modifier groups', generic: 'Manual setup', winner: 'dineopen' },
  { feature: 'Multi-Language Menus', dineopen: 'Hindi, English, Regional', generic: 'English only', winner: 'dineopen' },
  { feature: 'Biryani Portion Sizes', dineopen: 'Half/Full/Family', generic: 'Basic S/M/L', winner: 'dineopen' },
  { feature: 'Delivery Platform Integration', dineopen: 'Zomato, Swiggy, DoorDash, Uber Eats', generic: 'Limited', winner: 'dineopen' },
  { feature: 'Items with 5+ Modifiers', dineopen: 'Handles seamlessly', generic: 'Slows down / crashes', winner: 'dineopen' },
  { feature: 'Monthly Price', dineopen: 'From $10/mo', generic: '$50-150/mo', winner: 'dineopen' },
  { feature: 'Global Tax Support', dineopen: 'GST, VAT, Sales Tax', generic: 'Single region only', winner: 'dineopen' },
];

const cuisineFeatures = [
  {
    icon: '🌶️',
    title: 'Spice Level Selector',
    description: 'Built-in mild, medium, hot, and extra hot options on every menu item. Customers pick their preference on QR menus or staff selects at POS.',
  },
  {
    icon: '🍽️',
    title: 'Thali & Combo Builder',
    description: 'Let customers build their thali: choose dal, sabzi, roti type, rice variety, and extras. Each component can have its own modifiers.',
  },
  {
    icon: '🍛',
    title: 'Gravy vs Dry Selection',
    description: 'One-tap toggle between gravy and dry preparations for curries. No duplicate menu items needed for the same dish.',
  },
  {
    icon: '🫓',
    title: 'Naan & Roti Modifiers',
    description: 'Pre-configured modifier groups for bread: plain, butter, garlic, cheese, stuffed. Works for naan, roti, paratha, kulcha.',
  },
  {
    icon: '🍢',
    title: 'Tandoor & Marination Notes',
    description: 'Tandoori items with marination time tracking and preparation notes. Kitchen display shows marination status for each order.',
  },
  {
    icon: '🍚',
    title: 'Biryani Portion Sizes',
    description: 'Half plate, full plate, and family pack sizes with automatic price calculation. Works for biryani, pulao, and rice dishes.',
  },
  {
    icon: '🍮',
    title: 'Dessert Temperature Options',
    description: 'Hot gulab jamun, cold kulfi, room temperature barfi. Temperature preferences are sent directly to the kitchen display.',
  },
  {
    icon: '🌐',
    title: 'Multi-Language Menus',
    description: 'Display menu items in Hindi, English, Tamil, Telugu, Gujarati, and more. Essential for diverse staff and international customers.',
  },
];

const painPoints = [
  {
    icon: '📋',
    title: 'Complex Menus with 200+ Items',
    description: 'Indian restaurant menus are among the most complex in the world. Starters, tandoor, curries, biryanis, breads, rice, desserts, beverages — each with multiple modifiers. Generic POS systems were not designed for this level of menu depth.',
  },
  {
    icon: '🍱',
    title: 'Thali System Breaks Standard POS',
    description: 'A thali is not just one item — it is a customizable meal with 6-8 components. Generic POS systems treat it as a single line item with no way to customize each component. This leads to kitchen confusion and wrong orders.',
  },
  {
    icon: '📱',
    title: 'Delivery Platform Integration Gaps',
    description: 'Indian restaurants in India need Zomato and Swiggy integration. In the USA, you need DoorDash and Uber Eats. In the UK, Deliveroo and Just Eat. Most POS systems support only one region\'s delivery platforms.',
  },
  {
    icon: '🗣️',
    title: 'Multi-Language Staff & Customers',
    description: 'Your kitchen staff may speak Hindi, your front-of-house staff may speak English, and your customers may speak either. A POS that only supports English creates miscommunication and order errors.',
  },
];

const countryData = [
  {
    country: 'USA',
    flag: '🇺🇸',
    title: 'Indian Restaurants in the USA',
    types: 'Curry houses, Indian buffets, fast-casual Indian, fine dining Indian',
    delivery: 'DoorDash, Uber Eats, Grubhub',
    tax: 'Sales tax varies by state (0-10%)',
    highlight: 'Over 5,500 Indian restaurants across the US. Growing demand for authentic regional cuisine.',
  },
  {
    country: 'UK',
    flag: '🇬🇧',
    title: 'Indian Restaurants & Takeaways in the UK',
    types: 'Curry houses, Indian takeaways, Balti houses, fine dining',
    delivery: 'Deliveroo, Just Eat, Uber Eats',
    tax: 'VAT 20%',
    highlight: 'Over 12,000 Indian restaurants and takeaways. The UK curry industry generates over 5 billion GBP annually.',
  },
  {
    country: 'UAE',
    flag: '🇦🇪',
    title: 'Indian Restaurants in Dubai & Abu Dhabi',
    types: 'Indian restaurants, South Indian cafes, biryani houses, vegetarian restaurants',
    delivery: 'Talabat, Deliveroo, Zomato UAE',
    tax: 'VAT 5%',
    highlight: 'Massive Indian expat community. Indian cuisine is the most popular restaurant category in the UAE.',
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    title: 'Indian Restaurants in Toronto & Vancouver',
    types: 'Indian restaurants, Punjabi dhabas, South Indian, Indo-Chinese',
    delivery: 'Skip The Dishes, DoorDash, Uber Eats',
    tax: 'HST/GST (5-15%)',
    highlight: 'Fastest-growing cuisine category in Canada. Strong demand in Toronto, Vancouver, Calgary, and Brampton.',
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    title: 'Indian Restaurants in Sydney & Melbourne',
    types: 'Indian restaurants, curry houses, Indian street food, fine dining',
    delivery: 'Uber Eats, Menulog, DoorDash',
    tax: 'GST 10%',
    highlight: 'Indian cuisine is the third most popular in Australia. Major growth in Sydney, Melbourne, and Perth.',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    title: 'Restaurants Across India',
    types: 'Multi-cuisine, regional specialty, QSR chains, cloud kitchens, dhabas',
    delivery: 'Zomato, Swiggy',
    tax: 'GST 5%',
    highlight: 'Home market with 7.5 million+ food service outlets. Fastest digital adoption in the restaurant industry.',
  },
];

const faqItems = [
  {
    question: 'What is the best POS system for Indian restaurants?',
    answer: 'DineOpen is purpose-built for Indian cuisine complexity. It handles spice level customization, thali combo builders, gravy/dry selections, naan modifiers, and biryani portion sizes natively. Unlike generic POS systems that require workarounds for Indian menus with 200+ items, DineOpen handles complex modifiers seamlessly.',
  },
  {
    question: 'Can DineOpen handle thali combos and meal deals?',
    answer: 'Yes. DineOpen has a native thali/combo builder where customers choose their dal, sabzi, roti type, rice variety, and extras. Each component supports its own modifiers like spice level. The kitchen display shows each component separately for accurate preparation.',
  },
  {
    question: 'Does DineOpen support Hindi and regional language menus?',
    answer: 'Yes. DineOpen supports multi-language menus including Hindi, English, Tamil, Telugu, Gujarati, Punjabi, and more. Menu items can be displayed in multiple languages simultaneously — helpful for diverse staff teams and international customers.',
  },
  {
    question: 'Does DineOpen integrate with Zomato and Swiggy?',
    answer: 'Yes. For Indian restaurants in India, DineOpen integrates with Zomato and Swiggy. For restaurants abroad, it integrates with DoorDash, Uber Eats, Deliveroo, Just Eat, Talabat, Skip The Dishes, and Menulog depending on your country.',
  },
  {
    question: 'Does DineOpen work for Indian restaurants in USA, UK, and UAE?',
    answer: 'Absolutely. DineOpen is used by Indian restaurants across the USA, UK, UAE, Canada, Australia, and India. It supports local tax regulations (sales tax, VAT, GST), local delivery platform integrations, and multi-currency billing for each country.',
  },
];

export default function IndianRestaurantPOSClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <CommonHeader />

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            Built for Indian Cuisine
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Only POS <span className="text-orange-600">Built for Indian Restaurants</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Spice level customization, thali combos, complex modifiers, butter chicken vs paneer tikka variants — DineOpen understands Indian cuisine better than any other POS.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://dineopen.com/login"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-50 transition-colors"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">80,000+</div>
              <div className="text-sm text-gray-600">Indian Restaurants Worldwide</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">200+</div>
              <div className="text-sm text-gray-600">Avg. Menu Items (High Complexity)</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">5-8</div>
              <div className="text-sm text-gray-600">Avg. Modifiers Per Dish</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">$10/mo</div>
              <div className="text-sm text-gray-600">DineOpen Starting Price</div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Cuisine-Specific Features */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Indian Cuisine-Specific Features</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Every feature designed around how Indian restaurants actually operate — from spice levels to thali combos.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cuisineFeatures.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Why Indian Restaurants Struggle with Generic POS</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Indian cuisine is among the most complex in the world. Generic POS systems were not built for it.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((point) => (
              <div key={point.title} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-400">
                <div className="text-2xl mb-2">{point.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{point.title}</h3>
                <p className="text-gray-600 text-sm">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country-Specific Section */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">DineOpen for Indian Restaurants by Country</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Wherever you run your Indian restaurant, DineOpen supports local delivery platforms, tax rules, and payment methods.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countryData.map((item) => (
              <div key={item.country} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{item.flag}</span>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Types:</span> {item.types}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Delivery:</span> {item.delivery}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Tax:</span> {item.tax}</p>
                  <p className="text-orange-700 font-medium mt-3">{item.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">DineOpen vs Generic POS for Indian Restaurants</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            See why Indian restaurant owners choose DineOpen over generic POS systems that were not designed for cuisine complexity.
          </p>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center bg-green-100">DineOpen</th>
                  <th className="p-4 text-center">Generic POS</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium text-sm">{row.feature}</td>
                    <td className={`p-4 text-center text-sm ${row.winner === 'dineopen' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                      {row.dineopen}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-600">{row.generic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">&ldquo;</div>
          <blockquote className="text-xl md:text-2xl text-gray-800 font-medium mb-6 leading-relaxed">
            As an Indian restaurant owner in Toronto, I tried 3 different POS systems before DineOpen. None of them could handle our thali combos or spice level customizations properly. Orders kept going to the kitchen wrong. DineOpen fixed all of that in the first week.
          </blockquote>
          <div className="text-gray-600">
            <span className="font-bold text-gray-900">Rajesh P.</span> — Owner, Masala Kitchen, Toronto
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Try DineOpen Free for Your Indian Restaurant</h2>
          <p className="text-xl text-gray-600 mb-8">
            30-day free trial. No credit card required. Set up your full Indian menu with spice levels, thali combos, and modifiers in under an hour.
          </p>
          <Link
            href="https://dineopen.com/login"
            className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-orange-700 transition-colors inline-block"
          >
            Start Free Trial - No Credit Card
          </Link>
          <p className="text-gray-500 mt-4">Works in USA, UK, UAE, Canada, Australia, and India</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((faq) => (
              <div key={faq.question} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/solutions/indian-restaurant-pos" variant="alternative" />
      <Footer />
    </div>
  );
}
