'use client';

import ToolPageTemplate from '../../../components/ToolPageTemplate';
import { FaClipboardList, FaBell, FaPrint, FaClock, FaUtensils, FaSync } from 'react-icons/fa';

export default function KOTSystemClient() {
  const features = [
    {
      icon: FaBell,
      title: 'Real-Time Order Alerts',
      description: 'New orders appear instantly in the kitchen with audio alerts. No more shouting across the restaurant.'
    },
    {
      icon: FaClipboardList,
      title: 'Order Details & Notes',
      description: 'See item names, quantities, table numbers, and special instructions clearly on each KOT.'
    },
    {
      icon: FaPrint,
      title: 'Auto-Print KOTs',
      description: 'KOTs print automatically to kitchen printers when orders are placed. Zero delay.'
    },
    {
      icon: FaClock,
      title: 'Order Timing Tracking',
      description: 'See how long each order has been waiting. Prioritize older orders to reduce customer wait times.'
    },
    {
      icon: FaUtensils,
      title: 'Status Updates',
      description: 'Kitchen marks items as preparing or ready. Wait staff sees updates and knows when to serve.'
    },
    {
      icon: FaSync,
      title: 'Multi-Station Support',
      description: 'Route orders to different stations - main kitchen, bar, dessert counter. Each gets relevant items only.'
    },
  ];

  const howItWorks = [
    {
      title: 'Order Placed at POS/QR',
      description: 'When an order is placed from POS or QR menu, it instantly sends to the kitchen system.'
    },
    {
      title: 'KOT Prints in Kitchen',
      description: 'A kitchen order ticket prints automatically with all details - items, table, notes, time.'
    },
    {
      title: 'Kitchen Prepares & Updates',
      description: 'Cooks prepare items and mark them as ready. Status updates visible to service staff.'
    },
    {
      title: 'Staff Serves & Completes',
      description: 'Waiters see ready items, serve customers, and mark orders as served. Full tracking.'
    },
  ];

  const benefits = [
    'Eliminate verbal order miscommunication',
    'Reduce order preparation time',
    'Track kitchen performance',
    'Never miss a special instruction',
    'Prioritize orders automatically',
    'Route to correct kitchen stations'
  ];

  const faqs = [
    {
      question: 'Do I need a special display for the kitchen?',
      answer: 'No! KOTs can print to thermal printers or display on any tablet/screen. Use existing hardware.'
    },
    {
      question: 'Can kitchen staff mark items as ready?',
      answer: 'Yes. Kitchen staff can tap items on the display to mark as preparing or ready. Service staff sees these updates instantly.'
    },
    {
      question: 'Does it show special dietary instructions?',
      answer: 'Absolutely. All notes like "no onion", "extra spicy", or "allergy warning" appear prominently on the KOT.'
    },
    {
      question: 'Can I route orders to different kitchen stations?',
      answer: 'Yes. Set up stations (main kitchen, bar, dessert) and items route automatically to the right station based on category.'
    },
    {
      question: 'What printers work with the KOT system?',
      answer: 'Standard 80mm thermal printers used in restaurants. Works with most common brands over USB or network.'
    },
  ];

  const relatedTools = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
    { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator' },
    { name: 'Table Management', href: '/tools/table-management' },
    { name: 'Loyalty Program', href: '/tools/loyalty-program' },
  ];

  return (
    <ToolPageTemplate
      toolName="KOT System"
      toolIcon={FaClipboardList}
      heroTitle="Kitchen Order Tickets"
      heroHighlight="Without the Chaos"
      heroDescription="Digital KOT system that sends orders to your kitchen instantly. Real-time tracking, auto-printing, and status updates. No more lost orders or shouting across the restaurant."
      features={features}
      howItWorks={howItWorks}
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Streamline Your Kitchen Today"
      ctaDescription="Reduce errors and speed up service with digital KOTs. Free to try."
      relatedTools={relatedTools}
    />
  );
}
