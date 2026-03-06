'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaRupeeSign, FaClock, FaUsers, FaBoxes, FaReceipt, FaChartLine } from 'react-icons/fa';

export default function RestaurantsClient() {
  const painPoints = [
    {
      icon: FaRupeeSign,
      title: 'Thin Profit Margins',
      description: 'With rising food costs and competition, every rupee counts. Manual processes waste money.'
    },
    {
      icon: FaClock,
      title: 'Peak Hour Chaos',
      description: 'Lunch and dinner rush leads to order mix-ups, slow service, and frustrated customers.'
    },
    {
      icon: FaUsers,
      title: 'Staff Management',
      description: 'High turnover, training new staff, and tracking performance is a constant struggle.'
    },
    {
      icon: FaBoxes,
      title: 'Inventory Leakage',
      description: 'Ingredients going bad, theft, and no visibility into actual consumption hurts your bottom line.'
    },
    {
      icon: FaReceipt,
      title: 'GST Compliance',
      description: 'Manual GST calculations, invoice errors, and month-end filing headaches.'
    },
    {
      icon: FaChartLine,
      title: 'No Business Insights',
      description: 'Running blind without knowing which dishes sell, peak times, or customer preferences.'
    },
  ];

  const benefits = [
    'Reduce order errors by 90% with digital ordering',
    'Save 2+ hours daily on billing and reporting',
    'GST-compliant invoices generated automatically',
    'Know your best-selling dishes and peak hours',
    'Build customer loyalty with rewards program',
    'Accept all payment modes - UPI, cards, cash'
  ];

  const testimonial = {
    quote: 'DineOpen transformed how we run our restaurant. Order errors are down, customers are happier, and I finally have time to focus on the food.',
    author: 'Ramesh Kumar',
    business: 'Sagar Family Restaurant, Bangalore'
  };

  const faqs = [
    {
      question: 'Is DineOpen suitable for small restaurants with 5-10 tables?',
      answer: 'Absolutely! DineOpen is designed for restaurants of all sizes. Many of our customers run small family restaurants with 5-10 tables. You get enterprise features at affordable pricing.'
    },
    {
      question: 'Do I need expensive hardware?',
      answer: 'No. DineOpen works on any smartphone, tablet, or laptop you already have. You can use your existing thermal printer for KOT and bills.'
    },
    {
      question: 'Can my staff use it without technical knowledge?',
      answer: 'Yes! The interface is designed to be simple and intuitive. Most staff learn it within a day. We also provide Hindi language support.'
    },
    {
      question: 'What about internet connectivity issues?',
      answer: 'DineOpen has offline mode for critical operations. Orders can be taken offline and sync when connection restores. Perfect for areas with spotty internet.'
    },
    {
      question: 'How does QR ordering work for dine-in?',
      answer: 'Each table gets a QR code. Customers scan it with their phone, see your menu, and place orders directly. Orders appear on your POS and KOT screens instantly.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Hotels', href: '/for/hotels' },
    { name: 'Bakeries', href: '/for/bakeries' },
  ];

  return (
    <IndustryPageTemplate
      industry="Small Restaurants"
      heroTitle="Restaurant POS Made"
      heroHighlight="Simple & Affordable"
      heroDescription="Whether you run a family restaurant, dhaba, or local eatery - DineOpen gives you all the tools to manage orders, billing, inventory, and customers without the complexity or high costs."
      quickAnswer={<><strong>The best POS for small restaurants in India is DineOpen.</strong> It starts at ₹300/month with zero transaction fees and includes GST billing, AI voice ordering in Hindi/English, inventory management, kitchen display, loyalty programs, and QR code ordering. No hardware purchase needed — works on any phone or tablet. Set up in 15 minutes. 30-day free trial, no credit card required. Used by 1,000+ restaurants across India.</>}
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Simplify Your Restaurant?"
      ctaDescription="Join thousands of Indian restaurants using DineOpen. Start free, no credit card needed."
      relatedIndustries={relatedIndustries}
    />
  );
}
