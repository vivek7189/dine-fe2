'use client';

import ToolPageTemplate from '../../../components/ToolPageTemplate';
import { FaChair, FaMapMarked, FaClock, FaUsers, FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';

export default function TableManagementClient() {
  const features = [
    {
      icon: FaMapMarked,
      title: 'Visual Floor Plan',
      description: 'See your restaurant layout at a glance. Color-coded tables show status instantly.'
    },
    {
      icon: FaChair,
      title: 'Real-Time Status',
      description: 'Tables change color as status updates - free, occupied, ordered, billing, cleaning.'
    },
    {
      icon: FaClock,
      title: 'Table Timing',
      description: 'See how long each table has been occupied. Identify tables ready for turnover.'
    },
    {
      icon: FaUsers,
      title: 'Guest Count Tracking',
      description: 'Know how many guests at each table. Helps with capacity planning and billing.'
    },
    {
      icon: FaExchangeAlt,
      title: 'Table Transfer',
      description: 'Move orders between tables easily. Merge or split tables for large groups.'
    },
    {
      icon: FaCalendarAlt,
      title: 'Reservation Support',
      description: 'Block tables for reservations. See upcoming bookings on the floor plan.'
    },
  ];

  const howItWorks = [
    {
      title: 'Set Up Your Floor Plan',
      description: 'Create your restaurant layout. Add tables, sections (indoor, outdoor, AC), and seating capacity.'
    },
    {
      title: 'Customers Seated',
      description: 'When customers arrive, tap the table to mark as occupied. Enter guest count.'
    },
    {
      title: 'Track Table Journey',
      description: 'Status updates automatically as orders are placed and billed. See everything at a glance.'
    },
    {
      title: 'Turn Tables Faster',
      description: 'Identify long-occupied tables, speed up billing, and seat waiting customers faster.'
    },
  ];

  const benefits = [
    'See all table status at a glance',
    'Reduce wait times for customers',
    'Optimize table turnover',
    'Handle reservations smoothly',
    'Merge/split tables for groups',
    'Track peak occupancy times'
  ];

  const faqs = [
    {
      question: 'Can I customize the floor plan layout?',
      answer: 'Yes! Add, remove, and position tables to match your actual restaurant layout. Create sections for different areas.'
    },
    {
      question: 'What do the different colors mean?',
      answer: 'Green = free, Yellow = occupied (not ordered), Orange = has active order, Red = billing in progress, Gray = reserved/blocked.'
    },
    {
      question: 'Can I handle walk-ins and reservations together?',
      answer: 'Yes. Reserved tables show a marker. Walk-ins can be seated at any free, non-reserved table. Smooth handling of both.'
    },
    {
      question: 'How do I merge tables for a large group?',
      answer: 'Select multiple tables and merge them into one order. All items appear on a single bill. Split back anytime.'
    },
    {
      question: 'Does it show table occupancy duration?',
      answer: 'Yes. See how long each table has been occupied. Helps identify tables that might be ready to turn over.'
    },
  ];

  const relatedTools = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
    { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator' },
    { name: 'KOT System', href: '/tools/kot-system' },
    { name: 'Loyalty Program', href: '/tools/loyalty-program' },
  ];

  return (
    <ToolPageTemplate
      toolName="Table Management"
      toolIcon={FaChair}
      heroTitle="See Your Restaurant"
      heroHighlight="Floor in Real-Time"
      heroDescription="Visual table management that shows every table status at a glance. Know what is free, occupied, or billing. Turn tables faster and seat customers quicker."
      features={features}
      howItWorks={howItWorks}
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Take Control of Your Floor"
      ctaDescription="Visual table management for smarter seating. Free to start."
      relatedTools={relatedTools}
    />
  );
}
