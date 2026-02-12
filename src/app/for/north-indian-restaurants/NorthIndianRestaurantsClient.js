'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaFire, FaLayerGroup, FaClock, FaDrumstickBite, FaChartBar } from 'react-icons/fa';

export default function NorthIndianRestaurantsClient() {
  const painPoints = [
    {
      icon: FaFire,
      title: 'Tandoor Queue Chaos',
      description: 'Naan, roti, kulcha - tandoor can only handle so many at once. Orders pile up, customers wait.'
    },
    {
      icon: FaLayerGroup,
      title: 'Portion Confusion',
      description: 'Half/Full gravy, Quarter/Half/Full chicken - pricing and kitchen instructions get messy.'
    },
    {
      icon: FaDrumstickBite,
      title: 'Gravy vs Dry Tracking',
      description: 'Same dish in gravy and dry form. Kitchen mixes them up, wrong orders go out.'
    },
    {
      icon: FaClock,
      title: 'Dinner Rush Timing',
      description: '8-10 PM is chaos. 50 tables want food simultaneously. Kitchen can\'t keep up.'
    },
    {
      icon: FaUtensils,
      title: 'Dal Makhani Never Ready',
      description: 'Slow-cooked items like dal makhani run out. No system predicts demand.'
    },
    {
      icon: FaChartBar,
      title: 'Paneer vs Chicken Cost',
      description: 'Can\'t track which dishes make money. Paneer seems cheap but is it really?'
    },
  ];

  const benefits = [
    'Tandoor queue management with timing',
    'Half/Full portion variants everywhere',
    'Gravy/Dry clearly marked on KOT',
    'Rush hour order prioritization',
    'Pre-batch alerts for slow-cooked items',
    'Item-wise profitability tracking'
  ];

  const testimonial = {
    quote: 'Our tandoor used to be the bottleneck. DineOpen queues naan orders intelligently - kitchen knows exactly what\'s coming. No more cold rotis, no more angry customers. Dinner service is finally smooth.',
    author: 'Harpreet Singh',
    business: 'Punjab Da Dhaba, Delhi'
  };

  const faqs = [
    {
      question: 'How does tandoor queue management work?',
      answer: 'Set your tandoor capacity (e.g., 8 naans at a time). Orders are batched automatically. Kitchen display shows the queue with timing. When one batch is done, next batch instructions appear. Customers get hot rotis, not cold ones waiting on plates.'
    },
    {
      question: 'Can I manage Half/Full portions easily?',
      answer: 'Yes! Create variants for any item - Quarter, Half, Full, Family. Kitchen sees the portion size clearly. Inventory deducts correctly based on size. Even combo meals work with portion options.'
    },
    {
      question: 'How do you handle gravy vs dry versions?',
      answer: 'Each dish can have preparation styles - Gravy, Dry, Bhuna, Roast. Kitchen ticket clearly shows the style in large text. No more mix-ups between Chicken Gravy and Chicken Dry.'
    },
    {
      question: 'Can it handle dinner rush efficiently?',
      answer: 'DineOpen has rush hour mode. Orders are prioritized by wait time. Kitchen display highlights delayed orders. Tandoor and main kitchen can be separate queues. You can see bottlenecks in real-time.'
    },
    {
      question: 'How do I know which dishes are most profitable?',
      answer: 'Recipe costing calculates exact ingredient cost per dish. Combine with sales data to see profit margin per item. You might find that butter chicken makes more than paneer butter masala despite lower price.'
    },
  ];

  const relatedIndustries = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
    { name: 'Dhabas', href: '/for/dhabas' },
    { name: 'Fine Dining', href: '/for/fine-dining' },
    { name: 'Biryani', href: '/for/biryani-restaurants' },
  ];

  return (
    <IndustryPageTemplate
      industry="North Indian Restaurants"
      heroTitle="POS Built for"
      heroHighlight="North Indian Kitchens"
      heroDescription="Tandoor management, butter chicken by the half, dal makhani alerts - DineOpen understands North Indian restaurants. From Punjabi dhabas to Mughlai fine dining, features built for how you actually cook and serve."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve North Indian Perfection?"
      ctaDescription="Join hundreds of North Indian restaurants using DineOpen for smoother kitchen operations."
      relatedIndustries={relatedIndustries}
    />
  );
}
