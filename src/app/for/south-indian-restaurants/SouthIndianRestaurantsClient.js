'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaUtensils, FaCoffee, FaLayerGroup, FaClock, FaLanguage, FaLeaf } from 'react-icons/fa';

export default function SouthIndianRestaurantsClient() {
  const painPoints = [
    {
      icon: FaLayerGroup,
      title: '50+ Dosa Variants',
      description: 'Masala, set, rava, onion, ghee roast - managing all variants and combos is overwhelming.'
    },
    {
      icon: FaCoffee,
      title: 'Filter Coffee Tracking',
      description: 'Tumbler by tumbler billing, decoction inventory - coffee management is its own challenge.'
    },
    {
      icon: FaClock,
      title: 'Breakfast Rush',
      description: '7-10 AM sees 100+ customers. Token system breaks, orders get mixed, queues grow.'
    },
    {
      icon: FaUtensils,
      title: 'Tiffin vs Meals Confusion',
      description: 'Tiffin items, meals combos, a-la-carte - billing gets complicated fast.'
    },
    {
      icon: FaLanguage,
      title: 'Tamil/Kannada Staff',
      description: 'Staff speak regional languages. English-only POS creates training nightmares.'
    },
    {
      icon: FaLeaf,
      title: 'Sambar & Chutney Tracking',
      description: 'Unlimited sambar/chutney with tiffin - hard to track consumption and costs.'
    },
  ];

  const benefits = [
    'Easy dosa variant management (50+ types)',
    'Filter coffee by tumbler with decoction tracking',
    'Token-based quick service for breakfast',
    'Tiffin/Meals/Combo smart categorization',
    'Tamil, Kannada, Telugu language support',
    'Sambar/chutney consumption analytics'
  ];

  const testimonial = {
    quote: 'Our darshini serves 500 dosas during breakfast. DineOpen token system handles the crowd perfectly. Tamil menu makes billing fast. Filter coffee tracking finally makes sense.',
    author: 'Suresh Iyer',
    business: 'Vidyarthi Bhavan Style Restaurant, Bangalore'
  };

  const faqs = [
    {
      question: 'How do you manage 50+ dosa variants?',
      answer: 'Create a base dosa item, then add variants (masala, set, rava, etc.) with one click. Kitchen display groups by dosa type. Popular variants can be pinned for quick access. Even Mysore masala, paper roast, and family dosas are easy to bill.'
    },
    {
      question: 'Does filter coffee tracking really work?',
      answer: 'Yes! Track coffee by tumbler or cup. Set your decoction:milk ratio, and inventory auto-calculates. Get alerts when decoction stock is low. Even handle filter coffee subscriptions for regulars.'
    },
    {
      question: 'How does the token system work for darshinis?',
      answer: 'Customer orders at counter, gets a token. Kitchen display shows token queue. When ready, token number flashes. Customer picks up. No confusion, no shouting, handles 100+ customers/hour.'
    },
    {
      question: 'Can staff use it in Tamil or Kannada?',
      answer: 'Yes! Full interface in Tamil, Kannada, Telugu, and Malayalam. Voice ordering also works in these languages. Training time drops from days to hours when staff see their language.'
    },
    {
      question: 'How do you track sambar/chutney consumption?',
      answer: 'Two options: Fixed allocation per tiffin item (auto-deducts from inventory), or consumption tracking where staff log refill requests. Both give you accurate cost per customer data.'
    },
  ];

  const relatedIndustries = [
    { name: 'Indian Restaurants', href: '/for/indian-restaurants' },
    { name: 'Cafes', href: '/for/cafes' },
    { name: 'QSR', href: '/for/qsr' },
    { name: 'Thali Restaurants', href: '/for/thali-restaurants' },
  ];

  return (
    <IndustryPageTemplate
      industry="South Indian Restaurants"
      heroTitle="POS Built for"
      heroHighlight="South Indian Flavors"
      heroDescription="From crispy dosas to filter coffee, idli-vada to Chettinad specials - DineOpen understands South Indian restaurants. Variant management, token system, and regional language support built for how you actually work."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Serve South Indian Excellence?"
      ctaDescription="Join hundreds of South Indian restaurants using DineOpen for faster service and happier customers."
      relatedIndustries={relatedIndustries}
    />
  );
}
