'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaRupeeSign, FaMobile, FaBoxes, FaClock, FaChartLine, FaFileInvoice } from 'react-icons/fa';

export default function SmallBusinessClient() {
  const painPoints = [
    {
      icon: FaRupeeSign,
      title: 'Expensive POS Systems',
      description: 'Most POS systems charge thousands per month with costly hardware. Small restaurants cannot afford that.'
    },
    {
      icon: FaMobile,
      title: 'Complex Setup & Training',
      description: 'Complicated software that takes weeks to learn. Your staff needs something simple that works on day one.'
    },
    {
      icon: FaBoxes,
      title: 'No Inventory Visibility',
      description: 'Tracking stock on paper or in your head leads to wastage, over-ordering, and surprise shortages during service.'
    },
    {
      icon: FaClock,
      title: 'Slow Manual Billing',
      description: 'Writing bills by hand or using a calculator wastes time and causes errors during busy hours.'
    },
    {
      icon: FaChartLine,
      title: 'No Business Insights',
      description: 'You know you are busy but have no data on bestsellers, peak hours, or actual profit margins.'
    },
    {
      icon: FaFileInvoice,
      title: 'GST Compliance Headaches',
      description: 'Manually calculating GST and filing returns is error-prone and time-consuming for small business owners.'
    },
  ];

  const benefits = [
    'Free plan — start with zero investment',
    'Works on your existing phone or tablet',
    'Set up in under 5 minutes, no training needed',
    'GST-compliant billing out of the box',
    'QR code menus — no printing costs',
    'Track sales, inventory & profits in real-time'
  ];

  const testimonial = {
    quote: 'I run a small 20-seat restaurant. Before DineOpen, I was billing on paper. Now my billing is faster, I track every rupee of inventory, and my GST filing takes minutes instead of hours.',
    author: 'Rajesh Patel',
    business: 'Rajesh Kitchen, Ahmedabad'
  };

  const faqs = [
    {
      question: 'Is DineOpen really free for small businesses?',
      answer: 'Yes! Our Starter plan is completely free and includes billing, QR menus, and basic order management. No credit card required, no hidden fees. Upgrade to paid plans starting at just $9.99/month when you need advanced features.'
    },
    {
      question: 'Do I need to buy any special hardware?',
      answer: 'No. DineOpen works on any device you already own — smartphone, tablet, or laptop. No need for POS terminals, receipt printers, or other expensive hardware. This is what makes it the best POS for small businesses on a budget.'
    },
    {
      question: 'How long does it take to set up?',
      answer: 'Under 5 minutes. Sign up, add your menu items, and start billing. The interface is designed to be simple enough that anyone can use it without training.'
    },
    {
      question: 'Can it handle GST billing for my restaurant?',
      answer: 'Yes. DineOpen automatically calculates GST on every bill, generates GST-compliant invoices, and provides reports that make filing easy. CGST, SGST, and IGST are all supported.'
    },
    {
      question: 'What if I want to grow from 1 outlet to multiple?',
      answer: 'DineOpen grows with you. Start with the free plan for one outlet, and seamlessly upgrade when you expand. Multi-location management, centralized reporting, and chain management are all built in.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Dhabas', href: '/for/dhabas' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Street Food', href: '/for/street-food' },
    { name: 'QSR', href: '/for/qsr' },
  ];

  return (
    <IndustryPageTemplate
      industry="Small Business Restaurants"
      heroTitle="Best POS System for"
      heroHighlight="Small Businesses"
      heroDescription="The affordable POS system built for small restaurants, cafes, and food stalls. Free plan available. Works on your phone — no expensive hardware needed. Set up in 5 minutes."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Start Free — No Credit Card Needed"
      ctaDescription="Join thousands of small business owners using DineOpen. Free plan forever, paid plans from $9.99/month."
      relatedIndustries={relatedIndustries}
    />
  );
}
