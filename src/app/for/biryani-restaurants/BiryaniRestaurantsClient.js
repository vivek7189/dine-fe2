'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaClock, FaLayerGroup, FaFire, FaMotorcycle, FaChartLine } from 'react-icons/fa';

export default function BiryaniRestaurantsClient() {
  const painPoints = [
    {
      icon: FaLayerGroup,
      title: 'Portion Chaos',
      description: 'Half, full, family pack - managing different sizes with different prices is a billing nightmare.'
    },
    {
      icon: FaClock,
      title: 'Dum Timing Issues',
      description: 'Biryani needs precise dum timing. Kitchen loses track of which batch is ready when.'
    },
    {
      icon: FaFire,
      title: 'High-Volume Rush',
      description: 'Friday/weekend dinner rush brings 5x orders. Systems crash, orders get mixed up.'
    },
    {
      icon: FaUtensils,
      title: 'Accompaniment Tracking',
      description: 'Raita, salan, mirchi ka salan - tracking sides with each biryani order is chaotic.'
    },
    {
      icon: FaMotorcycle,
      title: 'Delivery Delays',
      description: 'Zomato/Swiggy orders mix with dine-in. Packaging gets confused, riders wait.'
    },
    {
      icon: FaChartLine,
      title: 'Wastage Problems',
      description: 'Overcooked rice, excess gravy - hard to track biryani-specific wastage and costs.'
    },
  ];

  const benefits = [
    'Half/Full/Family portion variants with one click',
    'Dum timer & batch tracking on kitchen display',
    'High-volume mode for weekend rushes',
    'Auto-attach raita, salan with combos',
    'Separate Zomato/Swiggy queue management',
    'Rice & meat inventory tracking per batch'
  ];

  const testimonial = {
    quote: 'We serve 300 biryanis on weekends. DineOpen batch tracking ensures every biryani is fresh from dum. Portion management saved us hours of billing confusion. Perfect for biryani restaurants.',
    author: 'Mohammed Farhan',
    business: 'Bawarchi Biryani House, Hyderabad'
  };

  const faqs = [
    {
      question: 'How does portion management work for biryani?',
      answer: 'Create variants for Quarter, Half, Full, and Family sizes. Each has its own price and inventory calculation. Kitchen display shows the size clearly. You can also create combos with accompaniments at fixed prices.'
    },
    {
      question: 'Can I track dum biryani cooking batches?',
      answer: 'Yes! Set up batch cooking in kitchen management. Each batch has a timer, and staff get alerts when dum time is complete. Orders are assigned to batches, so customers get freshly cooked biryani.'
    },
    {
      question: 'How do you handle high-volume orders on weekends?',
      answer: 'DineOpen has a high-volume mode. Pre-batch popular items, queue orders intelligently, and the kitchen display prioritizes based on order time and cooking status. No more chaos during rush hours.'
    },
    {
      question: 'Does it work with Zomato and Swiggy?',
      answer: 'Yes! Direct integration with both platforms. Orders come straight to your kitchen display. Separate queue for delivery orders with rider tracking. Auto-print packaging labels.'
    },
    {
      question: 'Can I track biryani-specific inventory?',
      answer: 'Absolutely. Track basmati rice, meat (chicken/mutton/fish), spices separately. Recipe-based inventory deduction shows exactly how much each biryani batch uses. Get alerts before you run out.'
    },
  ];

  const relatedIndustries = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
    { name: 'North Indian', href: '/for/north-indian-restaurants' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
  ];

  return (
    <IndustryPageTemplate
      industry="Biryani Restaurants"
      heroTitle="POS Built for"
      heroHighlight="Biryani Perfection"
      heroDescription="From Hyderabadi dum to Lucknowi awadhi, Kolkata to Ambur - DineOpen understands biryani restaurants. Portion management, batch cooking, high-volume handling built for how biryani joints actually work."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve Perfect Biryani?"
      ctaDescription="Join hundreds of biryani restaurants using DineOpen for smoother operations and happier customers."
      relatedIndustries={relatedIndustries}
    />
  );
}
