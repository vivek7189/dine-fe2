'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaFire, FaLayerGroup, FaLanguage, FaLeaf, FaChartBar } from 'react-icons/fa';

export default function IndianRestaurantsClient() {
  const painPoints = [
    {
      icon: FaLayerGroup,
      title: 'Complex Thali Management',
      description: 'Unlimited thali items with refill tracking is impossible with basic POS systems.'
    },
    {
      icon: FaFire,
      title: 'Tandoor Order Timing',
      description: 'Rotis and naans need precise timing. Kitchen needs clear order sequencing.'
    },
    {
      icon: FaLanguage,
      title: 'Regional Language Barriers',
      description: 'Staff speak Hindi, Tamil, Bengali - POS only works in English.'
    },
    {
      icon: FaUtensils,
      title: 'Portion & Combo Chaos',
      description: 'Half plate, full plate, family pack - managing portions is a nightmare.'
    },
    {
      icon: FaLeaf,
      title: 'Veg/Non-Veg Separation',
      description: 'Customers need clear labeling. Kitchen needs separate KOTs.'
    },
    {
      icon: FaChartBar,
      title: 'Festival Rush Management',
      description: 'Diwali, Eid, Navratri bring 5x orders. Systems crash under load.'
    },
  ];

  const benefits = [
    'Unlimited thali items with refill tracking',
    'Tandoor queue management system',
    'Voice ordering in Hindi, Tamil, Telugu & more',
    'Half/Full/Family portion variants',
    'Veg/Non-Veg/Jain filtering & labeling',
    'Festival menu & rush hour handling'
  ];

  const testimonial = {
    quote: 'We serve 200 unlimited thalis daily. DineOpen tracks every refill, manages our tandoor queue, and handles weekend rushes without breaking a sweat. Perfect for Indian restaurants.',
    author: 'Ramesh Sharma',
    business: 'Rajdhani Thali, Delhi'
  };

  const faqs = [
    {
      question: 'Can I manage unlimited thali with refill tracking?',
      answer: 'Yes! DineOpen supports unlimited thali mode. Track each refill request, send to kitchen in batches, and manage serving sequence. Perfect for Gujarati, Rajasthani, and South Indian thali restaurants.'
    },
    {
      question: 'How does tandoor order management work?',
      answer: 'Set up a tandoor queue in your kitchen display. Rotis and naans are batched automatically, with timing alerts so they\'re served hot. Kitchen sees the queue and capacity at all times.'
    },
    {
      question: 'Does voice ordering work in Indian languages?',
      answer: 'Yes! AI voice ordering supports Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati and more. Staff can take orders in their preferred language, and it syncs to the kitchen instantly.'
    },
    {
      question: 'Can I separate veg and non-veg kitchen orders?',
      answer: 'Absolutely. Set up separate kitchen displays or printers for veg and non-veg sections. Items are clearly labeled with color codes on all KOTs and displays.'
    },
    {
      question: 'How do you handle biryani portions?',
      answer: 'Create variants for Single, Half, Full, and Family sizes with different prices. The kitchen sees the portion size clearly on every order. Works great for biryani, curry portions too.'
    },
  ];

  const relatedIndustries = [
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Fine Dining', href: '/for/fine-dining' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Indian Restaurants"
      heroTitle="POS Built for"
      heroHighlight="Indian Cuisine"
      heroDescription="From thali to tandoor, biryani to dosa - DineOpen understands Indian restaurants. Multi-language ordering, regional cuisine support, and features built for how Indian restaurants actually work."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve Better?"
      ctaDescription="Join thousands of Indian restaurants using DineOpen for smoother operations and happier guests."
      relatedIndustries={relatedIndustries}
    />
  );
}
