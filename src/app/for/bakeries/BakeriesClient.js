'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaClock, FaBirthdayCake, FaBoxes, FaReceipt, FaUsers, FaCalendarAlt } from 'react-icons/fa';

export default function BakeriesClient() {
  const painPoints = [
    {
      icon: FaClock,
      title: 'Festival Rush Chaos',
      description: 'Diwali, weddings, and festivals bring huge orders. Managing them manually leads to missed deadlines.'
    },
    {
      icon: FaBirthdayCake,
      title: 'Custom Cake Order Tracking',
      description: 'Remembering cake designs, delivery dates, and special requests without a system is error-prone.'
    },
    {
      icon: FaBoxes,
      title: 'Perishable Inventory',
      description: 'Cream, fruits, and ingredients go bad quickly. No visibility leads to wastage and losses.'
    },
    {
      icon: FaReceipt,
      title: 'Weighing & Pricing',
      description: 'Items sold by weight need accurate billing. Manual calculations lead to errors and disputes.'
    },
    {
      icon: FaUsers,
      title: 'Repeat Customer Tracking',
      description: 'Birthday cake orders repeat yearly but you have no system to remind customers proactively.'
    },
    {
      icon: FaCalendarAlt,
      title: 'Advance Order Management',
      description: 'Taking advance bookings for cakes and sweets without double-booking or forgetting.'
    },
  ];

  const benefits = [
    'Custom order tracking with all details',
    'Advance booking calendar for cakes',
    'Birthday reminder system for customers',
    'Weight-based item billing support',
    'Perishable inventory tracking',
    'Festival season bulk order management'
  ];

  const testimonial = {
    quote: 'Last Diwali we had 500+ advance orders. DineOpen helped us track every single one with delivery dates. Not a single order was missed!',
    author: 'Meena Patel',
    business: 'Sweet Delights Bakery, Ahmedabad'
  };

  const faqs = [
    {
      question: 'Can I manage custom cake orders with specific requirements?',
      answer: 'Yes! Record all details - cake size, flavor, design, message, delivery date and time. Get reminders before due dates. Never miss or forget an order.'
    },
    {
      question: 'How does weight-based billing work?',
      answer: 'Set up items that are sold by weight (per kg, per 100g). Enter the weight at billing and the price calculates automatically. Works for sweets, dry fruits, etc.'
    },
    {
      question: 'Can I track perishable inventory like cream?',
      answer: 'Track all ingredients including perishables. Set expiry alerts, see consumption patterns, and reduce wastage with better ordering.'
    },
    {
      question: 'Is there a way to remind customers about birthdays?',
      answer: 'Yes! Store customer birthdays. The system can send WhatsApp reminders before their family birthdays, suggesting they order a cake.'
    },
    {
      question: 'How do I handle festival bulk orders?',
      answer: 'Create bulk order entries with itemized lists, partial payments, and delivery schedules. Track production status and ensure timely delivery.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Bakeries & Sweet Shops"
      heroTitle="Bakery POS for"
      heroHighlight="Sweet Success"
      heroDescription="From daily bread sales to custom wedding cakes - DineOpen helps bakeries manage orders, track perishable inventory, and never miss a birthday reminder with smart bakery software."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Bake Up Better Business?"
      ctaDescription="Join bakeries using DineOpen for organized orders and happy customers."
      relatedIndustries={relatedIndustries}
    />
  );
}
