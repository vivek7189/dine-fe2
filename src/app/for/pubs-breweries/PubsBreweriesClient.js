'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaBeer, FaClock, FaIdCard, FaChartBar, FaGlassCheers, FaReceipt } from 'react-icons/fa';

export default function PubsBreweriesClient() {
  const painPoints = [
    {
      icon: FaBeer,
      title: 'Keg & Draft Tracking',
      description: 'How many pints left in each keg? When did we tap it? Manual tracking leads to over-pours and waste.'
    },
    {
      icon: FaClock,
      title: 'Happy Hour Management',
      description: 'Manually changing prices for happy hour and switching back leads to errors and revenue loss.'
    },
    {
      icon: FaGlassCheers,
      title: 'Tab Management Chaos',
      description: 'Multiple tabs open, customers forget to close, staff loses track. End-of-night is a nightmare.'
    },
    {
      icon: FaIdCard,
      title: 'Age Verification Compliance',
      description: 'Serving minors means losing license. No systematic way to verify and log age checks.'
    },
    {
      icon: FaChartBar,
      title: 'Liquor Inventory Control',
      description: 'Tracking pours, managing bottle inventory, preventing theft - it is all manual and unreliable.'
    },
    {
      icon: FaReceipt,
      title: 'Split Bills & Large Groups',
      description: 'Groups want to split bills. Some pay card, some cash, some specific items. It is chaotic.'
    },
  ];

  const benefits = [
    'Keg tracking with pour counts',
    'Automated happy hour pricing',
    'Tab management per customer',
    'Age verification logging',
    'Pour-level inventory control',
    'Flexible bill splitting',
    'Brewery batch tracking',
    'Late-night staff management'
  ];

  const testimonial = {
    quote: 'We have 12 beers on tap. DineOpen tracks every pour and tells us keg levels. Happy hour prices switch automatically. Inventory shrinkage dropped 30%!',
    author: 'Rohit Kapoor',
    business: 'Toit Brewpub, Bangalore'
  };

  const faqs = [
    {
      question: 'How does keg tracking work?',
      answer: 'Log when you tap a keg. System counts pours based on sales. Shows estimated remaining quantity. Get alerts when keg is near empty. Track yield vs expected.'
    },
    {
      question: 'Can happy hour prices change automatically?',
      answer: 'Yes! Set happy hour time slots and discounted prices. System automatically switches pricing at set times. No manual intervention needed.'
    },
    {
      question: 'How do I manage open tabs?',
      answer: 'Open tabs by customer name or table. Add drinks throughout the night. See all open tabs on dashboard. Quick close and settle. End-of-day report shows any unclosed tabs.'
    },
    {
      question: 'How do you handle split bills for groups?',
      answer: 'Split by amount, by person, or by items. Some can pay card, others cash. Move specific items to separate bills. Takes seconds, not minutes.'
    },
    {
      question: 'Can I track pour-level inventory for bottles?',
      answer: 'Yes! Track bottle inventory at pour level. Define standard pours (30ml, 60ml). System deducts from inventory per sale. Spot over-pouring or theft.'
    },
  ];

  const relatedIndustries = [
    { name: 'Bars & Pubs', href: '/for/bars-pubs' },
    { name: 'Restaurants', href: '/for/restaurants' },
    { name: 'Fine Dining', href: '/for/fine-dining' },
    { name: 'Hotels', href: '/for/hotels' },
  ];

  return (
    <IndustryPageTemplate
      industry="Pubs & Microbreweries"
      heroTitle="POS Built for"
      heroHighlight="Breweries & Pubs"
      heroDescription="Draft beers, craft cocktails, open tabs - DineOpen helps pubs and microbreweries manage kegs, happy hours, inventory, and late-night operations flawlessly."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Pour Smarter?"
      ctaDescription="Join leading pubs and breweries across India using DineOpen for better bar management."
      relatedIndustries={relatedIndustries}
    />
  );
}
