'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaClock, FaUsers, FaCoffee, FaReceipt, FaMobile, FaChartBar } from 'react-icons/fa';

export default function CafesClient() {
  const painPoints = [
    {
      icon: FaClock,
      title: 'Long Queues at Counter',
      description: 'Customers waiting in line during rush hours leads to lost sales and frustrated patrons.'
    },
    {
      icon: FaCoffee,
      title: 'Order Customization Chaos',
      description: 'Extra shot, oat milk, no sugar - managing customizations manually leads to errors.'
    },
    {
      icon: FaUsers,
      title: 'No Repeat Customer Data',
      description: 'Regulars visit daily but you cannot track their preferences or reward their loyalty.'
    },
    {
      icon: FaReceipt,
      title: 'Slow Billing Process',
      description: 'Manual billing slows down service, especially during morning and evening rush.'
    },
    {
      icon: FaMobile,
      title: 'No Online Ordering',
      description: 'Missing out on takeaway and pre-orders because there is no easy ordering system.'
    },
    {
      icon: FaChartBar,
      title: 'Inventory Blind Spots',
      description: 'Running out of milk or beans during peak hours because of poor stock visibility.'
    },
  ];

  const benefits = [
    'Skip-the-queue ordering with QR codes',
    'Handle complex customizations easily',
    'Build loyalty with points and rewards',
    'Fast checkout with one-tap billing',
    'Track bestsellers and slow-movers',
    'Pre-order system for takeaways'
  ];

  const testimonial = {
    quote: 'Our morning rush used to be chaotic. With DineOpen QR ordering, customers order from their phones while waiting. No more long queues!',
    author: 'Priya Sharma',
    business: 'Brew & Bite Cafe, Mumbai'
  };

  const faqs = [
    {
      question: 'Can customers order and pay before arriving?',
      answer: 'Yes! With DineOpen, customers can scan a QR code, order their coffee, and pay online. Their order is ready when they arrive.'
    },
    {
      question: 'How do I handle complex drink customizations?',
      answer: 'DineOpen supports unlimited variants and add-ons. Set up options like milk type, sugar level, shot count, and temperature - customers select easily on their phones.'
    },
    {
      question: 'Does it work for quick-service counter billing?',
      answer: 'Absolutely. The POS is optimized for fast checkout. One-tap items, quick search, and instant bill generation for counter service.'
    },
    {
      question: 'Can I run a loyalty program for regulars?',
      answer: 'Yes! Set up points per purchase, create rewards tiers, and track customer visits. Send them birthday offers and special promotions via WhatsApp.'
    },
    {
      question: 'What about inventory for perishables like milk?',
      answer: 'Track all inventory including perishables. Get low-stock alerts, track wastage, and see consumption patterns to order smarter.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Bakeries', href: '/for/bakeries' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Cafes & Coffee Shops"
      heroTitle="Cafe POS Built for"
      heroHighlight="Speed & Style"
      heroDescription="From morning coffee rushes to evening hangouts - DineOpen helps cafes serve faster, build loyal customers, and run smoother operations with QR ordering and smart billing."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Brew Up Better Business?"
      ctaDescription="Join hundreds of cafes using DineOpen for faster service and happier customers."
      relatedIndustries={relatedIndustries}
    />
  );
}
