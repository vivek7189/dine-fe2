'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaIceCream, FaSun, FaGift, FaPercentage, FaSnowflake, FaBoxOpen } from 'react-icons/fa';

export default function IceCreamParlorsClient() {
  const painPoints = [
    {
      icon: FaIceCream,
      title: 'Scoop & Topping Chaos',
      description: 'Single scoop, double scoop, cone, cup, toppings - calculating every combination manually is slow.'
    },
    {
      icon: FaSun,
      title: 'Seasonal Rush Management',
      description: 'Summer weekends are insane. Long queues, overwhelmed staff, and lost sales.'
    },
    {
      icon: FaGift,
      title: 'No Customer Loyalty Data',
      description: 'Kids bring families regularly but you cannot track favorites or reward frequent visitors.'
    },
    {
      icon: FaPercentage,
      title: 'Combo Pricing Complexity',
      description: 'Sundaes, shakes, combo deals - pricing gets confusing for staff and customers.'
    },
    {
      icon: FaSnowflake,
      title: 'Flavor Availability Issues',
      description: 'Popular flavors run out without warning. No system to track what is selling fast.'
    },
    {
      icon: FaBoxOpen,
      title: 'Take-Home Packs & Delivery',
      description: 'Managing party packs, home delivery, and different packaging sizes is complicated.'
    },
  ];

  const benefits = [
    'Scoop-based pricing system',
    'Topping and cone variants',
    'Visual menu for quick ordering',
    'Birthday club loyalty program',
    'Real-time flavor availability',
    'Party pack ordering',
    'Seasonal menu management',
    'Queue-busting mobile ordering'
  ];

  const testimonial = {
    quote: 'Summer weekends we serve 500+ customers. DineOpen visual menu lets even new staff bill perfectly. Our birthday club has 3000+ kids who get free scoops annually!',
    author: 'Priya Malhotra',
    business: 'Cream Stone, Bangalore'
  };

  const faqs = [
    {
      question: 'How do I handle scoop and topping combinations?',
      answer: 'Set base prices per scoop size (single/double/triple). Add toppings as modifiers with prices. System calculates total automatically. Works for cones, cups, or waffle bowls.'
    },
    {
      question: 'Can I run a birthday club for kids?',
      answer: 'Yes! Collect birthdays during billing. System auto-sends birthday wishes with free scoop coupon. Kids bring families - great for repeat business.'
    },
    {
      question: 'How do I manage flavor availability?',
      answer: 'Mark flavors as available/unavailable in real-time. QR menu shows only available flavors. Get alerts when stock runs low.'
    },
    {
      question: 'Can customers order via QR to skip queues?',
      answer: 'Yes! Customers scan QR, see visual menu with all flavors and photos, place order, pay online. Get token number and collect when ready. No queue!'
    },
    {
      question: 'How do I handle party packs and bulk orders?',
      answer: 'Create party pack products (1L, 2L, 5L). Take advance bookings for birthday parties. Manage home delivery with address and time slots.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Sweet Shops', href: '/for/sweet-shops' },
    { name: 'Juice Bars', href: '/for/juice-bars' },
    { name: 'Bakeries', href: '/for/bakeries' },
  ];

  return (
    <IndustryPageTemplate
      industry="Ice Cream Parlors"
      heroTitle="Best POS System for"
      heroHighlight="Ice Cream Shops"
      heroDescription="The best POS system for ice cream shops. Scoops, cones, sundaes, shakes - DineOpen handles all combinations with visual menus, loyalty programs, and queue-busting features. Free 30-day trial."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Scoop Up More Sales?"
      ctaDescription="Join ice cream shops worldwide using DineOpen — the best POS system for ice cream parlors. Free 30-day trial."
      relatedIndustries={relatedIndustries}
    />
  );
}
