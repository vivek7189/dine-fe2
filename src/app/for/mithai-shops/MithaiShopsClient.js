'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaBalanceScale, FaGift, FaCalendarAlt, FaLayerGroup, FaTruck, FaChartBar } from 'react-icons/fa';

export default function MithaiShopsClient() {
  const painPoints = [
    {
      icon: FaBalanceScale,
      title: 'Weight-Based Billing Errors',
      description: 'Manual weight entry leads to mistakes. Price per kg calculations are error-prone.'
    },
    {
      icon: FaGift,
      title: 'Gift Box Complexity',
      description: 'Mixed boxes with 5 sweets, corporate gifting, festival packs - billing is a nightmare.'
    },
    {
      icon: FaCalendarAlt,
      title: 'Diwali/Festival Rush',
      description: '10x normal orders during festivals. Staff overwhelmed, queues endless, orders lost.'
    },
    {
      icon: FaLayerGroup,
      title: 'Fresh vs Dry Inventory',
      description: 'Rasgulla spoils in 2 days, kaju katli lasts weeks. Managing expiry is chaotic.'
    },
    {
      icon: FaTruck,
      title: 'Bulk Order Management',
      description: 'Wedding orders, corporate bulk, party orders - tracking and delivery scheduling is manual.'
    },
    {
      icon: FaChartBar,
      title: 'No Cost Tracking',
      description: 'Ghee prices fluctuate, sugar costs change. No idea which sweets are actually profitable.'
    },
  ];

  const benefits = [
    'Scale integration for automatic weight billing',
    'Mixed gift box builder with one-click pricing',
    'Festival mode handles 10x volume',
    'Expiry tracking for perishable items',
    'Bulk order management with scheduling',
    'Ingredient cost tracking per sweet'
  ];

  const testimonial = {
    quote: 'Diwali used to be chaos. Now with DineOpen, our 4 billing counters handle the rush smoothly. Gift box builder saves 2 minutes per order. Festival revenue doubled because we could serve more customers.',
    author: 'Ramesh Halwai',
    business: 'Gulab Sweets, Jaipur'
  };

  const faqs = [
    {
      question: 'Does it integrate with weighing scales?',
      answer: 'Yes! Connect digital scales directly. Weight appears on screen automatically. Just select the sweet, place on scale, price calculates instantly. No manual entry, no errors.'
    },
    {
      question: 'How does the gift box builder work?',
      answer: 'Create a box, add sweets with quantities, system calculates total price including box cost. Save popular combinations as presets. Corporate bulk orders can select from your preset gift boxes.'
    },
    {
      question: 'Can it handle Diwali rush?',
      answer: 'Festival mode optimizes everything. Multiple billing counters, quick-select popular items, token system for pickup, bulk order separate queue. We\'ve handled shops doing 5000+ orders in one day.'
    },
    {
      question: 'How do you track perishable sweets?',
      answer: 'Each batch has production date. System shows items nearing expiry. Alerts for items that should be sold/discounted. Rasgulla different from kaju katli - each has its own shelf life settings.'
    },
    {
      question: 'Can I track profitability per sweet?',
      answer: 'Yes! Enter recipes with ingredient quantities. System tracks ghee, sugar, dry fruits costs. When prices change, profitability updates automatically. Know exactly which sweets make money.'
    },
  ];

  const relatedIndustries = [
    { name: 'Bakeries', href: '/for/bakeries' },
    { name: 'Sweet Shops', href: '/for/sweet-shops' },
    { name: 'Street Food', href: '/for/street-food' },
    { name: 'Catering', href: '/for/catering' },
  ];

  return (
    <IndustryPageTemplate
      industry="Mithai Shops"
      heroTitle="POS Built for"
      heroHighlight="Indian Sweets"
      heroDescription="Ladoo, barfi, rasgulla, gulab jamun - DineOpen understands mithai shops. Weight-based billing, gift box building, festival rush handling built for halwai shops across India."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Sweeten Your Business?"
      ctaDescription="Join hundreds of mithai shops using DineOpen for faster billing and better inventory control."
      relatedIndustries={relatedIndustries}
    />
  );
}
