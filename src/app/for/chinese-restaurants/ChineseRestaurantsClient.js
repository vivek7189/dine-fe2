'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaFire, FaPepperHot, FaLayerGroup, FaClock, FaMotorcycle, FaChartLine } from 'react-icons/fa';

export default function ChineseRestaurantsClient() {
  const painPoints = [
    {
      icon: FaFire,
      title: 'Wok Station Overload',
      description: 'Multiple orders to different wok stations. Kitchen chaos during peak hours.'
    },
    {
      icon: FaPepperHot,
      title: 'Customization Complexity',
      description: 'Spice level, gravy dry/semi-dry, extra garlic - too many variations to track.'
    },
    {
      icon: FaLayerGroup,
      title: 'Combo Meal Management',
      description: 'Noodles + Manchurian + Soup combos with mix-match options are hard to bill.'
    },
    {
      icon: FaClock,
      title: 'High-Speed Takeaway',
      description: 'Chinese food is popular for takeaway. Slow billing means lost customers.'
    },
    {
      icon: FaMotorcycle,
      title: 'Delivery Order Surge',
      description: 'Zomato and Swiggy orders flood in. Hard to manage with dine-in.'
    },
    {
      icon: FaChartLine,
      title: 'Inventory for Sauces',
      description: 'Tracking soy sauce, vinegar, schezwan paste consumption is guesswork.'
    },
  ];

  const benefits = [
    'Wok station routing & queue management',
    'Unlimited customization options per item',
    'Easy combo meal builder with variants',
    'Fast checkout for high-volume takeaway',
    'Delivery platform integration',
    'Sauce & ingredient consumption tracking'
  ];

  const testimonial = {
    quote: 'We do 300+ takeaway orders daily. DineOpen handles our wok stations perfectly - each chef sees their queue. Spice level and gravy type show clearly on every KOT. No more confusion!',
    author: 'Wong Chen',
    business: 'Dragon Palace, Bangalore'
  };

  const faqs = [
    {
      question: 'How do you handle multiple wok stations?',
      answer: 'Set up different kitchen displays for each wok station or section. Orders are automatically routed based on item type. Each chef sees only their queue with preparation time estimates.'
    },
    {
      question: 'Can customers specify spice level and gravy type?',
      answer: 'Yes! Create customization options like Spice Level (Mild/Medium/Hot/Extra Hot) and Gravy (Dry/Semi-Dry/Gravy). These show clearly on kitchen orders and customer receipts.'
    },
    {
      question: 'How do combo meals work?',
      answer: 'Build combo templates with required and optional items. Example: Pick 1 Noodle + Pick 1 Manchurian + Free Soup. System calculates combo price automatically with all customizations.'
    },
    {
      question: 'Is it fast enough for busy takeaway counters?',
      answer: 'Absolutely. Quick-search menu, one-tap popular items, and instant billing. Most orders bill in under 30 seconds. Perfect for Chinese fast food and takeaway.'
    },
    {
      question: 'Can I track sauce and ingredient usage?',
      answer: 'Yes! Set up recipes with ingredient quantities. When you sell Hakka Noodles, the system deducts noodles, vegetables, soy sauce, etc. from inventory automatically.'
    },
  ];

  const relatedIndustries = [
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Food Trucks', href: '/for/food-trucks' },
    { name: 'Restaurants', href: '/for/restaurants' },
  ];

  return (
    <IndustryPageTemplate
      industry="Chinese & Indo-Chinese Restaurants"
      heroTitle="POS Built for"
      heroHighlight="Wok Speed"
      heroDescription="From noodles to manchurian, fried rice to momos - DineOpen handles high-volume Chinese restaurants with ease. Fast billing, wok station management, and customization tracking built-in."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Wok & Roll?"
      ctaDescription="Join hundreds of Chinese restaurants using DineOpen for faster service and better kitchen coordination."
      relatedIndustries={relatedIndustries}
    />
  );
}
