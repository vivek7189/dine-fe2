'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaCalendarCheck, FaUsers, FaClipboardList, FaRupeeSign, FaTruck, FaFileInvoice } from 'react-icons/fa';

export default function CateringClient() {
  const painPoints = [
    {
      icon: FaCalendarCheck,
      title: 'Booking & Scheduling Chaos',
      description: 'Multiple events on same day, double bookings, and missed follow-ups lead to lost business.'
    },
    {
      icon: FaUsers,
      title: 'Guest Count Changes',
      description: 'Last-minute guest count changes throw off your preparation, costing, and staffing.'
    },
    {
      icon: FaClipboardList,
      title: 'Menu Customization Headaches',
      description: 'Each client wants custom menus. Tracking preferences, allergies, and special requests is messy.'
    },
    {
      icon: FaRupeeSign,
      title: 'Payment Collection Issues',
      description: 'Tracking advance payments, balance dues, and payment milestones across multiple events is difficult.'
    },
    {
      icon: FaTruck,
      title: 'Logistics & Inventory',
      description: 'Coordinating equipment, staff, and ingredients across multiple venues is overwhelming.'
    },
    {
      icon: FaFileInvoice,
      title: 'Quote & Invoice Management',
      description: 'Creating professional quotes, converting to invoices, and managing GST compliance takes hours.'
    },
  ];

  const benefits = [
    'Event calendar with booking management',
    'Custom menu builder per event',
    'Guest count and per-plate pricing',
    'Advance payment tracking',
    'Professional quote generation',
    'Ingredient calculation per event',
    'Staff and equipment scheduling',
    'GST-compliant invoicing'
  ];

  const testimonial = {
    quote: 'During wedding season, we handle 20+ events. DineOpen\'s booking calendar and payment tracking saved us from double-bookings and missed payments. Revenue up 40%!',
    author: 'Rajesh Sharma',
    business: 'Royal Caterers, Delhi'
  };

  const faqs = [
    {
      question: 'Can I manage multiple events on the same day?',
      answer: 'Yes! The event calendar shows all bookings with venue, time, and guest count. Color-coded by event type (wedding, corporate, social). Get conflict alerts for overlapping bookings.'
    },
    {
      question: 'How do I handle custom menus for each client?',
      answer: 'Create menu templates and customize per client. Add notes for dietary restrictions, allergies, and special requests. Menu prints beautifully for client approval.'
    },
    {
      question: 'Can I track advance payments and balance?',
      answer: 'Set payment milestones (booking advance, 50% before event, final payment). Track received amounts, send payment reminders, and see all outstanding dues in one view.'
    },
    {
      question: 'How does ingredient calculation work?',
      answer: 'Define recipes with quantities per serving. System calculates total ingredients needed based on guest count. Generate purchase lists automatically.'
    },
    {
      question: 'Can I generate professional quotes?',
      answer: 'Create branded quotes with menu, pricing, terms. One-click convert to invoice when confirmed. All documents are GST-compliant with your branding.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Hotels', href: '/for/hotels' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Canteens', href: '/for/canteens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Catering Business"
      heroTitle="Software Built for"
      heroHighlight="Caterers"
      heroDescription="From wedding banquets to corporate lunches - DineOpen helps catering businesses manage bookings, custom menus, payments, and operations seamlessly."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Scale Your Catering Business?"
      ctaDescription="Join successful caterers across India using DineOpen for event management."
      relatedIndustries={relatedIndustries}
    />
  );
}
