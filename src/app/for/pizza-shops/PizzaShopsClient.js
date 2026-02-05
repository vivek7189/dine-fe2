'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaPizzaSlice, FaPlus, FaTruck, FaClock, FaLayerGroup, FaChartPie } from 'react-icons/fa';

export default function PizzaShopsClient() {
  const painPoints = [
    {
      icon: FaPlus,
      title: 'Topping Chaos',
      description: 'Extra cheese, no onions, add jalapenos - tracking customizations leads to errors.'
    },
    {
      icon: FaPizzaSlice,
      title: 'Half-Half Pizzas',
      description: 'Different toppings on each half? Most POS systems can\'t handle this.'
    },
    {
      icon: FaLayerGroup,
      title: 'Combo Deal Management',
      description: 'Pizza + Garlic Bread + Coke combos with size variations are billing nightmares.'
    },
    {
      icon: FaTruck,
      title: 'Delivery Zone Pricing',
      description: 'Different delivery charges for different areas. Hard to configure and track.'
    },
    {
      icon: FaClock,
      title: 'Prep Time Tracking',
      description: 'Customers expect Domino\'s-style order tracking. You can\'t provide it.'
    },
    {
      icon: FaChartPie,
      title: 'Topping Inventory',
      description: 'Running out of pepperoni on Saturday night kills sales. No visibility.'
    },
  ];

  const benefits = [
    'Unlimited toppings with add/remove pricing',
    'Half-half pizza support built-in',
    'Easy combo builder with size variants',
    'Delivery zone configuration',
    'Customer order tracking like Domino\'s',
    'Topping inventory with alerts'
  ];

  const testimonial = {
    quote: 'We were losing orders because of topping errors. DineOpen shows every customization clearly - in the app, on the kitchen screen, and on the box sticker. Errors dropped to near zero!',
    author: 'Ravi Mehta',
    business: 'Cheesy Crust Pizza, Pune'
  };

  const faqs = [
    {
      question: 'How do toppings and customizations work?',
      answer: 'Create topping groups with add/remove options and pricing. Extra cheese +₹50, No Onions, Add Jalapenos +₹30. Kitchen sees every modification clearly. Print on box labels too.'
    },
    {
      question: 'Can customers order half-half pizzas?',
      answer: 'Yes! Configure half-half options where customers pick different toppings for each half. System calculates pricing correctly and kitchen gets clear instructions for each half.'
    },
    {
      question: 'How do combo deals work?',
      answer: 'Build combos like "Large Pizza + 2 Sides + 2 Drinks" with mix-match options. Supports size variations within combos. Automatically applies best price.'
    },
    {
      question: 'Can I set different delivery charges by area?',
      answer: 'Absolutely. Define delivery zones by area/pincode with different charges. Customers see their delivery fee upfront when ordering online.'
    },
    {
      question: 'Is there order tracking for customers?',
      answer: 'Yes! Customers get WhatsApp updates at each stage - Order Confirmed, Preparing, Out for Delivery. Real-time tracking link like major pizza chains.'
    },
  ];

  const relatedIndustries = [
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Cafes', href: '/for/cafes' },
  ];

  return (
    <IndustryPageTemplate
      industry="Pizza Shops"
      heroTitle="POS Built for"
      heroHighlight="Pizza Perfection"
      heroDescription="From topping customizations to half-half pizzas, delivery zones to combo deals - DineOpen handles everything pizza shops need. Reduce errors, speed up service, track every slice."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Slice Up Better Business?"
      ctaDescription="Join pizza shops across India using DineOpen for faster, error-free orders."
      relatedIndustries={relatedIndustries}
    />
  );
}
