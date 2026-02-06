'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaBlender, FaLeaf, FaClock, FaAppleAlt, FaRecycle, FaMobile } from 'react-icons/fa';

export default function JuiceBarsClient() {
  const painPoints = [
    {
      icon: FaBlender,
      title: 'Endless Customizations',
      description: 'No sugar, extra ginger, add protein, less ice - every customer wants something different.'
    },
    {
      icon: FaClock,
      title: 'Morning Rush Bottleneck',
      description: 'Office goers want quick juice. Long wait times mean they go to competitors.'
    },
    {
      icon: FaAppleAlt,
      title: 'Perishable Inventory',
      description: 'Fruits expire quickly. Tracking freshness and managing wastage is critical.'
    },
    {
      icon: FaLeaf,
      title: 'Health-Conscious Customers',
      description: 'Customers ask about calories, ingredients, allergens. Staff struggles to answer.'
    },
    {
      icon: FaRecycle,
      title: 'Size & Add-on Confusion',
      description: 'Small, medium, large plus add-ons like chia seeds, protein - billing gets complicated.'
    },
    {
      icon: FaMobile,
      title: 'No Pre-Order Option',
      description: 'Customers want to order on the way and pick up ready juice. No system for this.'
    },
  ];

  const benefits = [
    'Quick customization handling',
    'Size and add-on pricing',
    'Ingredient and calorie display',
    'Perishable inventory tracking',
    'Pre-order and pickup',
    'Subscription juice plans',
    'Health-focused loyalty program',
    'WhatsApp ordering integration'
  ];

  const testimonial = {
    quote: 'Our juice bar near IT Park gets 200+ orders before 10 AM. DineOpen pre-order feature means juices are ready when customers arrive. Zero waiting, happy customers!',
    author: 'Kiran Rao',
    business: 'Fresh Press Juicery, Hyderabad'
  };

  const faqs = [
    {
      question: 'How do I handle all the customizations?',
      answer: 'Set up modifiers for each juice - sugar level, ice level, add-ons (protein, seeds, honey). Customers select on QR menu or staff taps options. Kitchen sees exact specifications.'
    },
    {
      question: 'Can customers pre-order for pickup?',
      answer: 'Yes! Customers order via QR or WhatsApp, select pickup time. Their juice is ready exactly when they arrive. Great for morning office rush.'
    },
    {
      question: 'How do I track fruit inventory and wastage?',
      answer: 'Track fruit stock with expiry dates. System alerts when fruits are near expiry. Record daily wastage. Reports show which fruits spoil most.'
    },
    {
      question: 'Can I show nutritional information?',
      answer: 'Yes! Add calories, ingredients, and allergen info to each item. Displays on QR menu. Health-conscious customers love this transparency.'
    },
    {
      question: 'Do you support juice subscription plans?',
      answer: 'Absolutely! Create weekly/monthly subscription packages. Customers pay upfront, redeem daily. Track remaining balance. Great for regular health-conscious customers.'
    },
  ];

  const relatedIndustries = [
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'Ice Cream Parlors', href: '/for/ice-cream-parlors' },
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'QSR', href: '/for/qsr' },
  ];

  return (
    <IndustryPageTemplate
      industry="Juice Bars & Smoothie Shops"
      heroTitle="POS Built for"
      heroHighlight="Juice Bars"
      heroDescription="Fresh juices, smoothies, health drinks - DineOpen helps juice bars handle customizations, pre-orders, perishable inventory, and health-conscious customers."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Blend Better Business?"
      ctaDescription="Join juice bars across India using DineOpen for faster, fresher service."
      relatedIndustries={relatedIndustries}
    />
  );
}
