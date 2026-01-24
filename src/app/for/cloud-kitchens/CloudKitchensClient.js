'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaRupeeSign, FaClock, FaBoxes, FaTruck, FaChartLine, FaUsers } from 'react-icons/fa';

export default function CloudKitchensClient() {
  const painPoints = [
    {
      icon: FaRupeeSign,
      title: 'High Aggregator Commissions',
      description: 'Zomato and Swiggy taking 25-30% of every order destroys your margins on delivery.'
    },
    {
      icon: FaClock,
      title: 'Order Management Chaos',
      description: 'Juggling orders from multiple platforms, each with different tablets and interfaces.'
    },
    {
      icon: FaBoxes,
      title: 'Multi-Brand Inventory',
      description: 'Running multiple brands from one kitchen but tracking inventory separately is a nightmare.'
    },
    {
      icon: FaTruck,
      title: 'Delivery Coordination',
      description: 'Managing delivery partners, tracking orders, and handling complaints across platforms.'
    },
    {
      icon: FaChartLine,
      title: 'No Unified Analytics',
      description: 'Sales data scattered across platforms making it hard to see the real picture.'
    },
    {
      icon: FaUsers,
      title: 'No Direct Customer Access',
      description: 'Aggregators own the customer relationship - you have no way to build loyalty.'
    },
  ];

  const benefits = [
    'Own your customer data and relationships',
    'Zero commission on direct orders',
    'Unified dashboard for all orders',
    'Multi-brand support from single kitchen',
    'Real-time inventory across brands',
    'Direct WhatsApp ordering channel'
  ];

  const testimonial = {
    quote: 'We run 3 brands from one kitchen. DineOpen unified everything - orders, inventory, reporting. And the direct ordering saves us lakhs in commissions.',
    author: 'Vikram Singh',
    business: 'Cloud Bites Kitchen, Delhi NCR'
  };

  const faqs = [
    {
      question: 'Can I manage multiple brands from one dashboard?',
      answer: 'Yes! DineOpen supports multi-brand operations. Manage different menus, pricing, and branding while sharing the same kitchen and inventory.'
    },
    {
      question: 'How do I get direct orders without aggregators?',
      answer: 'Create your own QR menus and ordering links. Share via WhatsApp, Instagram, or your website. Customers order directly - no commission fees.'
    },
    {
      question: 'Does it integrate with Zomato/Swiggy?',
      answer: 'You can continue using aggregators for discovery while building your direct ordering channel. Over time, shift more orders to direct and save on commissions.'
    },
    {
      question: 'How does inventory work with multiple brands?',
      answer: 'Set up shared ingredients across brands. When an order comes in for any brand, inventory updates automatically. See unified consumption reports.'
    },
    {
      question: 'Can I track delivery performance?',
      answer: 'Track order preparation times, delivery partner pickups, and customer delivery confirmations. Identify bottlenecks and improve efficiency.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Bakeries', href: '/for/bakeries' },
  ];

  return (
    <IndustryPageTemplate
      industry="Cloud Kitchens"
      heroTitle="Cloud Kitchen Software"
      heroHighlight="Without Commission Fees"
      heroDescription="Stop giving away 25-30% to aggregators. Build your direct ordering channel, manage multiple brands from one kitchen, and own your customer relationships with DineOpen."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Keep More of Your Revenue?"
      ctaDescription="Join smart cloud kitchens using DineOpen for direct orders and better margins."
      relatedIndustries={relatedIndustries}
    />
  );
}
