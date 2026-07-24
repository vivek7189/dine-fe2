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
      question: 'How does ice cream inventory management work?',
      answer: 'DineOpen tracks inventory at the ingredient level — milk, cream, cones, cups, toppings, and fruit purees. It calculates servings from current stock, sends low-stock alerts, monitors expiry dates, and auto-generates purchase orders. Track flavor-wise sales to stock smarter each season.'
    },
    {
      question: 'Can customers order via QR to skip queues?',
      answer: 'Yes! Customers scan QR, see visual menu with all flavors and photos, place order, pay online. Get token number and collect when ready. No queue! Shops using QR ordering report 40% higher throughput during peak summer hours.'
    },
    {
      question: 'How do I handle party packs and delivery orders?',
      answer: 'Create party pack products (1L, 2L, 5L tubs). Take advance bookings for birthday parties. Manage delivery zones, time slots, and dry ice charges. Track distribution orders separately from walk-in sales.'
    },
    {
      question: 'Is DineOpen suitable for small ice cream shops?',
      answer: 'Absolutely. DineOpen starts at $20/month (₹299 in India) with all features included — no add-on fees. Even a single-counter ice cream shop gets scoop billing, inventory, loyalty programs, and QR menus. New staff can learn it in 15 minutes.'
    },
    {
      question: 'Can I manage multiple ice cream shop locations?',
      answer: 'Yes. The Pro plan supports unlimited locations with centralized menu control, inter-branch stock transfers, location-wise sales comparison, and a single dashboard to manage everything — even from your phone.'
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
      heroDescription="The best POS system for ice cream shops. Scoops, cones, sundaes, shakes - DineOpen handles all combinations with visual menus, loyalty programs, and queue-busting features. Free 7-day trial."
      quickAnswer={<><strong>The best POS system for ice cream parlors in 2026 is DineOpen.</strong> It handles scoop/cone/cup combinations with visual menus, manages seasonal rush with quick billing (3 seconds per order), tracks ice cream inventory with temperature-sensitive alerts, and builds repeat customers with built-in loyalty rewards. Starts at $20/month (₹299 in India) with zero transaction fees. Works on any phone or tablet — no expensive hardware. 7-day free trial.</>}
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Scoop Up More Sales?"
      ctaDescription="Join ice cream shops worldwide using DineOpen — the best POS system for ice cream parlors. Free 7-day trial."
      relatedIndustries={relatedIndustries}
    />
  );
}
