'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUsers, FaClock, FaReceipt, FaExchangeAlt, FaChartBar, FaBuilding } from 'react-icons/fa';

export default function FoodCourtsClient() {
  const painPoints = [
    {
      icon: FaUsers,
      title: 'Multi-Vendor Chaos',
      description: 'Managing orders across multiple food stalls with different menus and pricing is overwhelming.'
    },
    {
      icon: FaClock,
      title: 'Peak Hour Bottlenecks',
      description: 'Lunch rush creates massive queues. Slow billing means lost customers and frustrated diners.'
    },
    {
      icon: FaReceipt,
      title: 'Split Payment Nightmares',
      description: 'Customers want to pay together for orders from different stalls. Manual splitting is error-prone.'
    },
    {
      icon: FaExchangeAlt,
      title: 'Token & Order Tracking',
      description: 'Customers get confused about which counter to collect from. No proper token system.'
    },
    {
      icon: FaChartBar,
      title: 'Vendor Settlement Issues',
      description: 'End-of-day settlement with each vendor is time-consuming and prone to disputes.'
    },
    {
      icon: FaBuilding,
      title: 'Mall Reporting Requirements',
      description: 'Mall management needs daily reports, GST compliance, and sales data in specific formats.'
    },
  ];

  const benefits = [
    'Centralized billing for all vendors',
    'Token-based order management',
    'Split payment across stalls',
    'Real-time KDS for each counter',
    'Automated vendor settlement',
    'Mall-ready reporting formats',
    'Prepaid card/wallet support',
    'Peak hour queue management'
  ];

  const testimonial = {
    quote: 'We have 12 vendors in our food court. DineOpen centralized everything - one bill, auto-settlement, token system. Weekend rush is now manageable!',
    author: 'Vikram Mehta',
    business: 'Food Plaza, Phoenix Mall, Pune'
  };

  const faqs = [
    {
      question: 'Can one bill include items from multiple vendors?',
      answer: 'Yes! Customers can order from any stall in the food court. All items appear on one bill, paid at one counter. System automatically splits revenue to each vendor.'
    },
    {
      question: 'How does the token system work?',
      answer: 'After payment, customer gets token numbers for each vendor. Each stall has a display showing which tokens are ready. Customers collect from respective counters.'
    },
    {
      question: 'How do you handle vendor settlements?',
      answer: 'DineOpen automatically calculates each vendor\'s share including any commission or rent. Generate settlement reports daily, weekly, or monthly with one click.'
    },
    {
      question: 'Can customers use prepaid cards or wallets?',
      answer: 'Yes! Set up food court wallet cards that customers can recharge. Great for corporate tie-ups. Also supports all UPI and card payments.'
    },
    {
      question: 'What reports can I generate for mall management?',
      answer: 'Generate footfall reports, hourly sales trends, vendor-wise performance, GST reports, and custom formats required by mall management. All exportable to Excel.'
    },
  ];

  const relatedIndustries = [
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Canteens', href: '/for/canteens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Food Courts & Mall Food Zones"
      heroTitle="POS Built for"
      heroHighlight="Food Courts"
      heroDescription="Manage multiple vendors, centralized billing, token systems, and automated settlements - DineOpen makes food court operations smooth even during peak rush hours."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Streamline Your Food Court?"
      ctaDescription="Join leading malls across India using DineOpen for food court management."
      relatedIndustries={relatedIndustries}
    />
  );
}
