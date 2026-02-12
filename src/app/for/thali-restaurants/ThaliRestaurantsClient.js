'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaSync, FaUsers, FaClock, FaList, FaChartBar } from 'react-icons/fa';

export default function ThaliRestaurantsClient() {
  const painPoints = [
    {
      icon: FaSync,
      title: 'Refill Chaos',
      description: 'Tracking unlimited refills manually is impossible. Staff forget, customers complain.'
    },
    {
      icon: FaList,
      title: 'Too Many Items',
      description: '15-20 items in a thali - managing inventory and kitchen preparation is overwhelming.'
    },
    {
      icon: FaUsers,
      title: 'Lunch Rush Madness',
      description: '200+ customers in 2 hours. Seating, serving, billing - everything breaks down.'
    },
    {
      icon: FaClock,
      title: 'Serving Sequence',
      description: 'Dal-rice-roti-sabzi - kitchen needs to serve in order. No system tracks this.'
    },
    {
      icon: FaUtensils,
      title: 'Veg/Jain Variations',
      description: 'Jain thali (no onion-garlic), Swaminarayan thali - tracking special requests is hard.'
    },
    {
      icon: FaChartBar,
      title: 'Cost Per Thali Unknown',
      description: 'With unlimited items and refills, calculating actual cost per customer is guesswork.'
    },
  ];

  const benefits = [
    'Unlimited thali mode with refill tracking',
    'One-click item refill requests to kitchen',
    'Seating management for high-volume lunch',
    'Kitchen display with serving sequence',
    'Jain/Veg/Special thali variants',
    'Cost analysis per thali with refill data'
  ];

  const testimonial = {
    quote: 'We serve 400 unlimited thalis daily. Before DineOpen, tracking refills was chaos. Now every sabzi refill goes to kitchen display, staff knows exactly what to serve. Our food cost dropped 12% because we finally know actual consumption.',
    author: 'Bhavesh Mehta',
    business: 'Gordhan Thal, Ahmedabad'
  };

  const faqs = [
    {
      question: 'How does unlimited thali tracking work?',
      answer: 'When a customer is seated, start their thali session. Every refill request is logged with one tap - staff use a handheld device or call button. Kitchen display shows which table needs what item. At checkout, you see total consumption per customer.'
    },
    {
      question: 'Can I manage different thali types?',
      answer: 'Yes! Create variants like Regular Thali, Special Thali, Jain Thali, Mini Thali. Each can have different items included. Kitchen automatically gets the right ticket based on thali type ordered.'
    },
    {
      question: 'How do you handle the lunch rush?',
      answer: 'Table management shows available seats in real-time. Quick seating mode assigns tables fast. Kitchen batches thali components. Multiple serving stations can be coordinated through displays.'
    },
    {
      question: 'Does it track Jain (no onion-garlic) orders separately?',
      answer: 'Absolutely. Mark any thali as Jain, and the kitchen ticket clearly shows this. You can set up separate cooking batches for Jain items to prevent cross-contamination.'
    },
    {
      question: 'How do I know my actual cost per thali?',
      answer: 'DineOpen tracks every refill against your recipe costs. Monthly reports show average refills per customer, cost per thali including all refills, and which items get requested most. This data helps optimize your menu and portions.'
    },
  ];

  const relatedIndustries = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
    { name: 'Gujarati Restaurants', href: '/india/gujarat' },
    { name: 'South Indian', href: '/for/south-indian-restaurants' },
    { name: 'Canteens', href: '/for/canteens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Thali Restaurants"
      heroTitle="POS Built for"
      heroHighlight="Unlimited Thalis"
      heroDescription="Gujarati thali, Rajasthani thali, South Indian meals - DineOpen understands unlimited dining. Refill tracking, high-volume service, and cost analysis built for thali restaurants."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve Unlimited Smiles?"
      ctaDescription="Join hundreds of thali restaurants using DineOpen for smoother service and better margins."
      relatedIndustries={relatedIndustries}
    />
  );
}
