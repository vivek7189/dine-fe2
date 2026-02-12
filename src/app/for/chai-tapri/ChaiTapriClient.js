'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaMugHot, FaClock, FaUsers, FaLayerGroup, FaCreditCard, FaChartBar } from 'react-icons/fa';

export default function ChaiTapriClient() {
  const painPoints = [
    {
      icon: FaClock,
      title: 'Speed is Everything',
      description: 'Customer wants chai in 30 seconds. Any delay and they go to the next tapri.'
    },
    {
      icon: FaLayerGroup,
      title: 'Cutting Chai Math',
      description: 'Half cutting, full cutting, special kadak - mental math for every order.'
    },
    {
      icon: FaUsers,
      title: 'Office Morning Rush',
      description: '8-10 AM, everyone wants chai. 50 people waiting, no way to track orders.'
    },
    {
      icon: FaMugHot,
      title: 'Chai + Biscuit Combos',
      description: 'Parle-G, Bourbon, samosa with chai - combo offers are hard to manage.'
    },
    {
      icon: FaCreditCard,
      title: 'UPI for ₹20 Chai?',
      description: 'Everyone pays UPI now. But QR scanning for small amounts slows things down.'
    },
    {
      icon: FaChartBar,
      title: 'Don\'t Know Daily Cups',
      description: 'Sold 200 or 300 cups today? No idea. Milk and tea powder ordering is guesswork.'
    },
  ];

  const benefits = [
    'One-tap billing - chai served in 3 seconds',
    'Cutting chai presets (half, full, special)',
    'Rush hour queue with token display',
    'Combo builder for chai + snacks',
    'Quick UPI with sound confirmation',
    'Daily cup count and inventory alerts'
  ];

  const testimonial = {
    quote: 'My tapri serves 400 cups daily. Before DineOpen, billing was mental math. Now one tap does everything. UPI sound tells me payment done. Finally know exactly how much chai I sell daily.',
    author: 'Raju Chaiwala',
    business: 'Sharma Chai Point, Noida'
  };

  const faqs = [
    {
      question: 'Is it really one-tap billing?',
      answer: 'Yes! Set up your popular items - Cutting Chai, Full Chai, Special Kadak - as quick buttons. One tap adds to bill, another tap shows UPI QR or completes cash sale. Under 3 seconds total.'
    },
    {
      question: 'How does cutting chai work?',
      answer: 'Create variants: Cutting (half), Full, Bada (large), Special Kadak. Each has its price. Tap the variant, done. Even track how many of each type sold.'
    },
    {
      question: 'Can it handle morning office rush?',
      answer: 'Token system for busy times. Customer orders, gets token number. Display shows ready tokens. No confusion, no "whose chai is this?" Handles 100+ orders per hour.'
    },
    {
      question: 'What about combos with biscuits?',
      answer: 'Build combos: Chai + Parle-G at ₹25, Chai + Samosa at ₹35. Customers see combo savings, you increase average order. One tap to add combo.'
    },
    {
      question: 'How do I track inventory?',
      answer: 'Set recipes - 1 cup chai uses X grams tea powder, Y ml milk. Daily cup count auto-deducts. Get alerts when stock is low. Never run out of milk during rush hour.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Street Food', href: '/for/street-food' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Juice Bars', href: '/for/juice-bars' },
  ];

  return (
    <IndustryPageTemplate
      industry="Chai Tapri"
      heroTitle="POS Built for"
      heroHighlight="Chai Lovers"
      heroDescription="Cutting chai, kadak chai, special masala - DineOpen understands chai tapris. One-tap billing, rush hour handling, inventory tracking built for tea stalls across India."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve Chai Faster?"
      ctaDescription="Join hundreds of chai tapris using DineOpen for quicker billing and better business insights."
      relatedIndustries={relatedIndustries}
    />
  );
}
