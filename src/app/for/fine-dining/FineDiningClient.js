'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaWineGlass, FaConciergeBell, FaUserTie, FaClock, FaGlassCheers, FaStar } from 'react-icons/fa';

export default function FineDiningClient() {
  const painPoints = [
    {
      icon: FaConciergeBell,
      title: 'Course Timing Coordination',
      description: 'Appetizer, main, dessert must be perfectly timed. Kitchen coordination is critical.'
    },
    {
      icon: FaWineGlass,
      title: 'Wine & Beverage Pairing',
      description: 'Suggesting wine pairings and tracking bottle service requires specialized features.'
    },
    {
      icon: FaUserTie,
      title: 'Guest Preference Memory',
      description: 'VIP guests expect you to remember their preferences, allergies, and favorites.'
    },
    {
      icon: FaClock,
      title: 'Reservation & Table Flow',
      description: 'Managing reservations, walk-ins, and table turnover for optimal revenue.'
    },
    {
      icon: FaGlassCheers,
      title: 'Complex Split Billing',
      description: 'Corporate dinners need split by item, person, or custom amounts.'
    },
    {
      icon: FaStar,
      title: 'Service Quality Tracking',
      description: 'No way to track service timing, guest feedback, and staff performance.'
    },
  ];

  const benefits = [
    'Course-based ordering with kitchen timing',
    'Wine list with pairing suggestions',
    'Guest CRM with preference tracking',
    'Reservation & table management',
    'Flexible split billing options',
    'Service timing & quality analytics'
  ];

  const testimonial = {
    quote: 'DineOpen transformed our service. We now track every VIP\'s preferences - their favorite table, wine choices, dietary needs. Our guests feel truly remembered. That\'s fine dining.',
    author: 'Chef Vikram Arora',
    business: 'The Grand Pavilion, Mumbai'
  };

  const faqs = [
    {
      question: 'How does course-based ordering work?',
      answer: 'Create multi-course menus with timing between courses. Kitchen gets "fire" notifications for each course. Servers see course status for all tables. Perfect pacing for fine dining experience.'
    },
    {
      question: 'Can I manage wine inventory and pairings?',
      answer: 'Yes! Full wine list management with bottle tracking, by-the-glass pours, and suggested pairings for each dish. Track cellar inventory and wine costs separately.'
    },
    {
      question: 'How do you track guest preferences?',
      answer: 'Built-in guest CRM stores preferences, allergies, birthdays, favorite dishes, seating preferences, and visit history. Staff see this info when guest is seated.'
    },
    {
      question: 'What split billing options are available?',
      answer: 'Split by item, by seat, by percentage, or custom amounts. Add automatic gratuity for large parties. Handle corporate billing with separate food/beverage invoices.'
    },
    {
      question: 'Is the system elegant enough for tableside use?',
      answer: 'Absolutely. Our waiter app has a clean, minimal interface perfect for fine dining. Discreet order taking, no loud sounds, elegant bill presentation.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Hotels', href: '/for/hotels' },
    { name: 'Bars & Pubs', href: '/for/bars-pubs' },
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
  ];

  return (
    <IndustryPageTemplate
      industry="Fine Dining"
      heroTitle="Elevate Your"
      heroHighlight="Dining Experience"
      heroDescription="Sophisticated POS for restaurants where every detail matters. Course timing, wine pairing, guest preferences, and elegant service - all managed seamlessly."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Elevate Your Service?"
      ctaDescription="Join premium restaurants using DineOpen to deliver exceptional dining experiences."
      relatedIndustries={relatedIndustries}
    />
  );
}
