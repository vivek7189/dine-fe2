'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaTruck, FaWifi, FaClock, FaRupeeSign, FaUtensils, FaUsers } from 'react-icons/fa';

export default function DhabasClient() {
  const painPoints = [
    {
      icon: FaTruck,
      title: 'Transient Customer Base',
      description: 'Truckers and travelers pass through once. No way to track them or build loyalty.'
    },
    {
      icon: FaWifi,
      title: 'Poor Internet Connectivity',
      description: 'Highway locations often have weak internet. Cloud-only systems fail frequently.'
    },
    {
      icon: FaClock,
      title: '24-Hour Operations',
      description: 'Running multiple shifts with different staff. Tracking sales and handover is messy.'
    },
    {
      icon: FaRupeeSign,
      title: 'Cash-Heavy Business',
      description: 'Most payments are cash. Tracking, reconciling, and preventing pilferage is challenging.'
    },
    {
      icon: FaUtensils,
      title: 'Simple Menu, Fast Service',
      description: 'Customers want quick food. Any delay in billing slows down the entire operation.'
    },
    {
      icon: FaUsers,
      title: 'Staff Turnover',
      description: 'High staff turnover means constant training. Need simple system anyone can use.'
    },
  ];

  const benefits = [
    'Works offline - syncs when online',
    'Driver loyalty with phone number',
    'Quick-tap billing interface',
    '24/7 shift management',
    'Cash drawer tracking',
    'Simple enough for any staff',
    'GST-compliant billing',
    'Runs on basic Android tablets'
  ];

  const testimonial = {
    quote: 'Our dhaba is on NH-8 with patchy internet. DineOpen works offline perfectly. We now have 2000+ truckers in our loyalty program who stop specifically at our dhaba!',
    author: 'Balwinder Singh',
    business: 'Punjab Da Dhaba, NH-8 Rajasthan'
  };

  const faqs = [
    {
      question: 'What if internet goes down?',
      answer: 'DineOpen works fully offline! Take orders, print bills, accept payments - all without internet. Data syncs automatically when connection returns. Zero disruption.'
    },
    {
      question: 'How does driver loyalty work without apps?',
      answer: 'Just ask for phone number. System tracks visits and spending. Send SMS offers for return visits. Top customers get automatic discounts. No app download needed.'
    },
    {
      question: 'Can staff with low education use it?',
      answer: 'Yes! Interface shows food images, not just text. Tap picture to add item. Hindi language support. Most dhaba staff learn in 1 hour.'
    },
    {
      question: 'How do I manage 24-hour shifts?',
      answer: 'Set up shift timings. Each shift closes with cash count and handover. See sales and collections per shift. Manager gets daily summary of all shifts.'
    },
    {
      question: 'What hardware do I need?',
      answer: 'Just a basic Android tablet (₹10,000+) and a Bluetooth printer. No fancy equipment needed. Runs on low-end devices perfect for dhaba environment.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Canteens', href: '/for/canteens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Dhabas & Highway Restaurants"
      heroTitle="POS Built for"
      heroHighlight="Dhabas"
      heroDescription="Highway dhabas, roadside restaurants, truck stops - DineOpen works offline, runs on basic tablets, and helps you build loyalty with traveling customers."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Modernize Your Dhaba?"
      ctaDescription="Join dhabas across India's highways using DineOpen for reliable billing."
      relatedIndustries={relatedIndustries}
    />
  );
}
