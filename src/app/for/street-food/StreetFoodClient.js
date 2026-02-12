'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaClock, FaUsers, FaLayerGroup, FaMobile, FaChartBar } from 'react-icons/fa';

export default function StreetFoodClient() {
  const painPoints = [
    {
      icon: FaClock,
      title: 'Evening Rush Madness',
      description: '6-9 PM sees 200+ customers. Queue grows, orders mix up, cash handling chaos.'
    },
    {
      icon: FaLayerGroup,
      title: 'Customization Chaos',
      description: 'Extra meethi chutney, no onion, spicy - every order has special requests.'
    },
    {
      icon: FaUsers,
      title: 'No Seating, No Tokens',
      description: 'Customers stand and wait. "Whose order?" shouting is the only system.'
    },
    {
      icon: FaUtensils,
      title: 'Plate vs Puri Count',
      description: 'Golgappa by plate or count? Chaat by plate or serving? Confusing pricing.'
    },
    {
      icon: FaMobile,
      title: 'UPI for ₹30?',
      description: 'Everyone wants to pay UPI. But fumbling with QR codes slows everything.'
    },
    {
      icon: FaChartBar,
      title: 'No Sales Data',
      description: 'Good day or bad day? No records. Ordering supplies is pure guesswork.'
    },
  ];

  const benefits = [
    'Quick-tap billing for common items',
    'Customization modifiers (spicy, no onion)',
    'Token system for order pickup',
    'Flexible pricing (plate/count/serving)',
    'Fast UPI with instant confirmation',
    'Daily sales tracking and reports'
  ];

  const testimonial = {
    quote: 'My chaat counter does 300 orders on weekends. Before, it was chaos. Now token numbers keep everything organized. Customers know when their order is ready. Sales doubled because I can serve faster.',
    author: 'Pappu Chaatwala',
    business: 'Sharma Chaat Bhandar, Delhi'
  };

  const faqs = [
    {
      question: 'How fast is the billing?',
      answer: 'Set up quick buttons for your popular items - Samosa Chaat, Pav Bhaji, Vada Pav. One tap adds to order. Modifiers (extra cheese, no onion) are another tap. Complete order in under 5 seconds.'
    },
    {
      question: 'How does the token system work?',
      answer: 'Customer orders, gets token number (receipt or just verbal). Kitchen display shows orders. When ready, call the token. Customer picks up. No confusion about whose order is whose.'
    },
    {
      question: 'Can I handle customizations easily?',
      answer: 'Yes! Add modifiers: Extra Spicy, No Onion, Add Cheese, Less Oil. Staff can tap modifiers quickly. Kitchen sees all special requests clearly on their display.'
    },
    {
      question: 'How do I price golgappa - plate or count?',
      answer: 'Both! Create "Golgappa Plate (6 pcs)" at one price, or "Golgappa Single" for count-based. Some stalls do both depending on customer preference. You choose what works.'
    },
    {
      question: 'Will it work on my phone?',
      answer: 'Yes! DineOpen works on any smartphone. No special hardware needed. Use your phone as the billing terminal. Add a small thermal printer for receipts if you want.'
    },
  ];

  const relatedIndustries = [
    { name: 'Chai Tapri', href: '/for/chai-tapri' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
  ];

  return (
    <IndustryPageTemplate
      industry="Street Food"
      heroTitle="POS Built for"
      heroHighlight="Street Food Stars"
      heroDescription="Chaat, vada pav, pav bhaji, golgappa - DineOpen understands street food. Quick billing, token system, customization handling built for the evening rush."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve Street Food Faster?"
      ctaDescription="Join hundreds of street food vendors using DineOpen for organized operations and better earnings."
      relatedIndustries={relatedIndustries}
    />
  );
}
