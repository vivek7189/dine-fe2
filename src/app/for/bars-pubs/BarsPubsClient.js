'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaClock, FaGlassCheers, FaBoxes, FaReceipt, FaUsers, FaChartBar } from 'react-icons/fa';

export default function BarsPubsClient() {
  const painPoints = [
    {
      icon: FaClock,
      title: 'Slow Service During Rush',
      description: 'Crowded nights mean long waits at the bar. Customers get frustrated and leave.'
    },
    {
      icon: FaGlassCheers,
      title: 'Tab Management Headaches',
      description: 'Keeping track of open tabs, split bills, and running totals is error-prone and slow.'
    },
    {
      icon: FaBoxes,
      title: 'Liquor Inventory Theft',
      description: 'Expensive spirits going missing. No way to track pours against sales accurately.'
    },
    {
      icon: FaReceipt,
      title: 'Happy Hour Pricing Errors',
      description: 'Manually changing prices for happy hours leads to billing mistakes and losses.'
    },
    {
      icon: FaUsers,
      title: 'No Customer Loyalty',
      description: 'Regulars visit often but there is no system to recognize and reward them.'
    },
    {
      icon: FaChartBar,
      title: 'No Sales Insights',
      description: 'Which drinks are popular? What sells on which nights? Running blind without data.'
    },
  ];

  const benefits = [
    'QR ordering reduces bar queue times',
    'Easy tab management and split bills',
    'Automated happy hour pricing',
    'Track liquor inventory by pour',
    'VIP customer recognition and rewards',
    'Sales analytics by day, time, and item'
  ];

  const testimonial = {
    quote: 'Friday nights used to be chaos at the bar. Now customers order via QR from their tables. Our bartenders focus on making great drinks, not taking orders.',
    author: 'Arun Mehta',
    business: 'The Hangout Pub, Pune'
  };

  const faqs = [
    {
      question: 'Can customers order drinks from their table?',
      answer: 'Yes! Customers scan a table QR code, see your drink menu with photos, and order directly. Orders appear at the bar instantly. Less crowding, faster service.'
    },
    {
      question: 'How does tab management work?',
      answer: 'Open tabs per table or customer. Add orders throughout the night. Close and settle when they leave. Support for split bills by item or amount.'
    },
    {
      question: 'Can I set up automatic happy hour pricing?',
      answer: 'Absolutely. Set time-based pricing rules. Drinks automatically show discounted prices during happy hours and revert after. No manual intervention needed.'
    },
    {
      question: 'How do I track liquor inventory?',
      answer: 'Track bottles in stock, set up pour sizes per drink, and compare theoretical vs actual consumption. Identify discrepancies and reduce pilferage.'
    },
    {
      question: 'Does it support age verification?',
      answer: 'The system can be configured to prompt age verification before alcohol orders. While DineOpen facilitates this, actual verification is the establishment responsibility.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Hotels', href: '/for/hotels' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Bars & Pubs"
      heroTitle="Bar POS for"
      heroHighlight="Busy Nights & Happy Hours"
      heroDescription="From happy hour rushes to late-night tabs - DineOpen helps bars and pubs serve faster, track inventory better, and build a loyal customer base with smart POS features."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Pour Profits, Not Losses?"
      ctaDescription="Join bars and pubs using DineOpen for smarter operations and happier customers."
      relatedIndustries={relatedIndustries}
    />
  );
}
