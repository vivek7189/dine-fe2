'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaWifi, FaMobile, FaClock, FaMapMarkerAlt, FaReceipt, FaChartLine } from 'react-icons/fa';

export default function FoodTrucksClient() {
  const painPoints = [
    {
      icon: FaWifi,
      title: 'Unreliable Internet',
      description: 'Moving locations means spotty wifi. Traditional POS systems fail when you need them most.'
    },
    {
      icon: FaMobile,
      title: 'Limited Counter Space',
      description: 'No room for bulky hardware. Need something that works on a phone in a cramped truck.'
    },
    {
      icon: FaClock,
      title: 'Fast Service Pressure',
      description: 'Long lines at events mean you need to bill fast. Slow systems kill your business.'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Multiple Location Tracking',
      description: 'Moving between spots - markets, events, office areas. Hard to track sales by location.'
    },
    {
      icon: FaReceipt,
      title: 'Cash-Heavy Operations',
      description: 'Lots of cash transactions make end-of-day reconciliation difficult and error-prone.'
    },
    {
      icon: FaChartLine,
      title: 'No Business Insights',
      description: 'Which location sells best? What items are popular? Running without data hurts growth.'
    },
  ];

  const benefits = [
    'Works offline - syncs when connected',
    'Phone-based POS - no hardware needed',
    'Fast one-tap billing for speed',
    'Track sales by location/event',
    'QR payments reduce cash handling',
    'See your best selling spots and items'
  ];

  const testimonial = {
    quote: 'I move my truck between 3 spots daily. DineOpen works on my phone, even offline. I finally know which location makes the most money.',
    author: 'Raju Yadav',
    business: 'Raju Momos Truck, Gurugram'
  };

  const faqs = [
    {
      question: 'Does it work without internet?',
      answer: 'Yes! DineOpen has offline mode. Take orders, bill customers, and accept UPI payments. Everything syncs automatically when you get connectivity.'
    },
    {
      question: 'Can I use just my smartphone?',
      answer: 'Absolutely. DineOpen is designed to work on any smartphone. No special hardware, no tablets required. Perfect for tight food truck spaces.'
    },
    {
      question: 'How do I track sales at different locations?',
      answer: 'Tag each session with your current location - market name, event, or area. See reports comparing sales across all your spots.'
    },
    {
      question: 'What about accepting payments?',
      answer: 'Accept UPI (scan and pay), cash, and cards. Generate digital receipts via WhatsApp. Reduce cash handling with QR payments.'
    },
    {
      question: 'Is it fast enough for busy events?',
      answer: 'Yes! Quick-add buttons for popular items, one-tap billing, and instant receipt generation. Designed for high-volume, fast service.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Bakeries', href: '/for/bakeries' },
  ];

  return (
    <IndustryPageTemplate
      industry="Food Trucks"
      heroTitle="Food Truck POS That"
      heroHighlight="Goes Where You Go"
      heroDescription="Mobile, offline-ready, and phone-based - DineOpen is built for food trucks that move. Bill fast, track locations, and grow your business on the go."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Roll with Better Tech?"
      ctaDescription="Join food trucks using DineOpen for mobile, reliable billing anywhere."
      relatedIndustries={relatedIndustries}
    />
  );
}
