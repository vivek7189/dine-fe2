'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaHotel, FaConciergeBell, FaBoxes, FaUsers, FaChartBar, FaReceipt } from 'react-icons/fa';

export default function HotelsClient() {
  const painPoints = [
    {
      icon: FaHotel,
      title: 'Multi-Outlet Complexity',
      description: 'Managing restaurant, bar, pool cafe, and room service with different systems is chaotic.'
    },
    {
      icon: FaConciergeBell,
      title: 'Room Service Coordination',
      description: 'Orders from rooms getting lost, delayed, or charged to wrong accounts.'
    },
    {
      icon: FaBoxes,
      title: 'Central Inventory Challenges',
      description: 'Tracking inventory across multiple F&B outlets with shared kitchen resources.'
    },
    {
      icon: FaUsers,
      title: 'Guest Profile Gaps',
      description: 'No connection between room guest data and their dining preferences.'
    },
    {
      icon: FaChartBar,
      title: 'Scattered Reporting',
      description: 'No unified view of F&B performance across all hotel dining outlets.'
    },
    {
      icon: FaReceipt,
      title: 'Room Charge Errors',
      description: 'Manual posting of F&B charges to room bills leads to disputes at checkout.'
    },
  ];

  const benefits = [
    'Unified POS for all F&B outlets',
    'Seamless room charge posting',
    'QR ordering for room service',
    'Shared inventory across outlets',
    'Guest dining preference tracking',
    'Consolidated F&B analytics'
  ];

  const testimonial = {
    quote: 'Managing 3 restaurants and room service was a nightmare before DineOpen. Now everything is in one system. Room charges post automatically. Guest checkout is smooth.',
    author: 'Sameer Khanna',
    business: 'Grand Plaza Hotel, Jaipur'
  };

  const faqs = [
    {
      question: 'Can I manage multiple F&B outlets from one system?',
      answer: 'Yes! DineOpen supports multi-outlet management. Each outlet has its own menu and settings, but you get unified reporting and inventory control.'
    },
    {
      question: 'How does room service ordering work?',
      answer: 'Guests can scan a QR code in their room to order food. Orders are tagged with room number and can be charged directly to their room bill.'
    },
    {
      question: 'Does it integrate with hotel PMS?',
      answer: 'DineOpen can be configured to sync with popular hotel property management systems for guest data and room charge posting.'
    },
    {
      question: 'Can I track guest dining preferences?',
      answer: 'Yes! Link dining history to guest profiles. Know their favorite dishes, dietary restrictions, and spending patterns for personalized service.'
    },
    {
      question: 'How does inventory work across outlets?',
      answer: 'Set up shared inventory for items used across outlets (like beverages). Track consumption by outlet while managing central purchasing.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Bars & Pubs', href: '/for/bars-pubs' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Hotels"
      heroTitle="Hotel F&B Management"
      heroHighlight="Simplified & Unified"
      heroDescription="From fine dining to room service to poolside cafe - DineOpen unifies all your hotel F&B operations with seamless room charge integration and multi-outlet management."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Elevate Your Hotel F&B?"
      ctaDescription="Join hotels using DineOpen for seamless F&B operations and guest satisfaction."
      relatedIndustries={relatedIndustries}
    />
  );
}
