'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaBolt, FaLayerGroup, FaTabletAlt, FaCar, FaUsers, FaChartLine } from 'react-icons/fa';

export default function QSRClient() {
  const painPoints = [
    {
      icon: FaBolt,
      title: 'Slow Checkout Speed',
      description: 'Customers wait in line. Slow billing means lost sales during rush hours.'
    },
    {
      icon: FaLayerGroup,
      title: 'Combo Complexity',
      description: 'Meal deals with drink + fries + burger variations are hard to configure.'
    },
    {
      icon: FaTabletAlt,
      title: 'No Self-Service Option',
      description: 'Customers want to order themselves. You have no kiosk or QR solution.'
    },
    {
      icon: FaCar,
      title: 'Drive-Thru Management',
      description: 'Managing drive-thru queue separately from counter is complicated.'
    },
    {
      icon: FaUsers,
      title: 'High Staff Turnover',
      description: 'New staff take weeks to learn the system. Training is expensive.'
    },
    {
      icon: FaChartLine,
      title: 'Peak Hour Analytics',
      description: 'No visibility into busiest hours, bestsellers, and staff productivity.'
    },
  ];

  const benefits = [
    'One-tap ordering for speed',
    'Easy combo meal configuration',
    'QR self-ordering & digital kiosks',
    'Drive-thru queue management',
    'Simple UI - train staff in minutes',
    'Real-time sales & productivity analytics'
  ];

  const testimonial = {
    quote: 'Speed is everything in QSR. DineOpen cut our average order time from 2 minutes to 45 seconds. Self-ordering QR codes handle 40% of our lunch rush now. Game changer!',
    author: 'Amit Jain',
    business: 'Burger Barn, Delhi'
  };

  const faqs = [
    {
      question: 'How fast is the billing process?',
      answer: 'Optimized for speed. Quick-access buttons for popular items, one-tap combos, instant search, and rapid checkout. Most orders complete in under 30 seconds.'
    },
    {
      question: 'Can I set up meal combos easily?',
      answer: 'Yes! Visual combo builder lets you create meal deals in minutes. Set up "Choose burger + Choose drink + Choose side" with automatic pricing. Supports upsells too.'
    },
    {
      question: 'Do you support self-ordering kiosks?',
      answer: 'Yes! Use tablets as self-ordering kiosks or provide QR codes for phone-based ordering. Customers order and pay themselves, reducing queue times.'
    },
    {
      question: 'How does drive-thru work?',
      answer: 'Separate drive-thru order queue with car tracking. Kitchen sees drive-thru orders highlighted. Track wait times and throughput. Integrates with existing speaker systems.'
    },
    {
      question: 'How quickly can new staff learn the system?',
      answer: 'The interface is designed for simplicity. Most staff learn core functions in under 30 minutes. Visual buttons, minimal text, and intuitive flow. No technical knowledge needed.'
    },
  ];

  const relatedIndustries = [
    { name: 'Pizza Shops', href: '/for/pizza-shops' },
    { name: 'Chinese Restaurants', href: '/for/chinese-restaurants' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Cafes', href: '/for/cafes' },
  ];

  return (
    <IndustryPageTemplate
      industry="QSR & Fast Food"
      heroTitle="POS Built for"
      heroHighlight="Speed & Scale"
      heroDescription="Quick service restaurants need quick systems. DineOpen is optimized for high-volume, fast-paced operations with self-ordering, combo meals, and lightning-fast checkout."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Speed Up Your Service?"
      ctaDescription="Join QSR brands using DineOpen to serve more customers, faster."
      relatedIndustries={relatedIndustries}
    />
  );
}
