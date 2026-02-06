'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaBalanceScale, FaGift, FaBoxOpen, FaCalendarAlt, FaReceipt, FaTruck } from 'react-icons/fa';

export default function SweetShopsClient() {
  const painPoints = [
    {
      icon: FaBalanceScale,
      title: 'Weight-Based Billing Errors',
      description: 'Manually calculating prices for weight-based items leads to billing mistakes and customer disputes.'
    },
    {
      icon: FaGift,
      title: 'Festival Season Chaos',
      description: 'Diwali, Rakhi, weddings - rush periods overwhelm your billing counter with long queues.'
    },
    {
      icon: FaBoxOpen,
      title: 'Box & Packaging Confusion',
      description: 'Managing different box sizes, packaging costs, and gift wrapping charges is complicated.'
    },
    {
      icon: FaCalendarAlt,
      title: 'Expiry & Freshness Tracking',
      description: 'Sweets have short shelf life. Tracking batch dates and managing freshness is critical.'
    },
    {
      icon: FaReceipt,
      title: 'GST Compliance Issues',
      description: 'Different GST rates for different sweets (5% vs 12%) makes tax filing complicated.'
    },
    {
      icon: FaTruck,
      title: 'Bulk & Corporate Orders',
      description: 'Managing large corporate orders, advance bookings, and bulk discounts manually is error-prone.'
    },
  ];

  const benefits = [
    'Integrated weighing scale support',
    'Quick billing for festival rush',
    'Box and packaging auto-calculation',
    'Batch and expiry date tracking',
    'Multi-GST rate handling (5%, 12%, 18%)',
    'Corporate order management',
    'Advance booking system',
    'Daily production tracking'
  ];

  const testimonial = {
    quote: 'During Diwali, we used to have 2-hour queues. With DineOpen weighing scale integration, we bill in seconds. Our festival sales doubled because we could serve more customers!',
    author: 'Ramesh Halwai',
    business: 'Shree Krishna Sweets, Ahmedabad'
  };

  const faqs = [
    {
      question: 'Does it work with electronic weighing scales?',
      answer: 'Yes! DineOpen integrates directly with electronic weighing scales. Place the item on scale, select product, and price calculates automatically based on weight.'
    },
    {
      question: 'How do I handle different box sizes and packaging?',
      answer: 'Set up box sizes (250g, 500g, 1kg) with packaging costs. When billing, select box type and it auto-adds to the total. Gift wrapping can be added as extra.'
    },
    {
      question: 'Can I manage advance orders for festivals?',
      answer: 'Absolutely! Take advance bookings with token amount, set delivery date, and get reminders. Track all pending orders in one dashboard.'
    },
    {
      question: 'How does it handle different GST rates?',
      answer: 'Each item can have its own GST rate (5% for basic sweets, 12% for branded, 18% for namkeen). GST is calculated automatically and reports are GST-filing ready.'
    },
    {
      question: 'Can I track daily production and wastage?',
      answer: 'Yes! Track how much of each sweet is produced daily, monitor sales vs production, and record wastage for expired items. Get insights on what sells best.'
    },
  ];

  const relatedIndustries = [
    { name: 'Bakeries', href: '/for/bakeries' },
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Ice Cream Parlors', href: '/for/ice-cream-parlors' },
  ];

  return (
    <IndustryPageTemplate
      industry="Sweet Shops & Mithai Stores"
      heroTitle="POS Built for"
      heroHighlight="Mithai & Sweet Shops"
      heroDescription="From weight-based billing to festival rush management - DineOpen helps halwais, mithai shops, and namkeen stores serve faster with accurate billing and GST compliance."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Sweeten Your Business?"
      ctaDescription="Join thousands of sweet shops across India using DineOpen for faster billing."
      relatedIndustries={relatedIndustries}
    />
  );
}
