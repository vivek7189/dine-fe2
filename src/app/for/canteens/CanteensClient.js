'use client';

import IndustryPageTemplate from '../../../components/IndustryPageTemplate';
import { FaCreditCard, FaClock, FaUsers, FaIdCard, FaChartLine, FaUtensils } from 'react-icons/fa';

export default function CanteensClient() {
  const painPoints = [
    {
      icon: FaCreditCard,
      title: 'Cash Handling Hassles',
      description: 'Daily cash collection from hundreds of employees is time-consuming and error-prone.'
    },
    {
      icon: FaClock,
      title: 'Lunch Rush Chaos',
      description: '500+ employees trying to eat in 1 hour. Long queues mean less eating time and frustration.'
    },
    {
      icon: FaUsers,
      title: 'Subsidy Management',
      description: 'Company subsidizes meals but tracking who ate what and calculating subsidies is complex.'
    },
    {
      icon: FaIdCard,
      title: 'Employee Verification',
      description: 'Ensuring only authorized employees access canteen and preventing misuse of meal benefits.'
    },
    {
      icon: FaChartLine,
      title: 'Consumption Reporting',
      description: 'HR needs monthly reports on canteen usage, costs, and employee-wise consumption.'
    },
    {
      icon: FaUtensils,
      title: 'Menu & Diet Management',
      description: 'Managing daily changing menus and catering to different dietary requirements.'
    },
  ];

  const benefits = [
    'Prepaid card/wallet system',
    'Employee ID card integration',
    'Meal subscription packages',
    'Subsidy and discount management',
    'Multi-shift meal tracking',
    'Quick tap-and-go billing',
    'HR-ready consumption reports',
    'Daily menu management'
  ];

  const testimonial = {
    quote: 'Our factory canteen serves 800 workers across 3 shifts. DineOpen prepaid cards eliminated cash handling. HR gets auto-reports. Billing time reduced by 70%!',
    author: 'Suresh Kumar',
    business: 'Tata Motors Canteen, Pune'
  };

  const faqs = [
    {
      question: 'How does the prepaid card system work?',
      answer: 'Issue cards to employees linked to their ID. They recharge via payroll deduction or self-payment. Tap card at counter for instant billing. No cash needed.'
    },
    {
      question: 'Can we manage company meal subsidies?',
      answer: 'Yes! Set subsidy rules - fixed amount per meal, percentage discount, or free meals up to a limit. System applies automatically and tracks company vs employee share.'
    },
    {
      question: 'How do you handle different shifts?',
      answer: 'Configure meal times per shift (breakfast, lunch, dinner). Employees can only use meal benefits during their designated slots. Prevents misuse.'
    },
    {
      question: 'Can we integrate with employee attendance?',
      answer: 'Yes! Integrate with HRMS/attendance systems. Only employees marked present can access canteen. Auto-sync employee data from your HR system.'
    },
    {
      question: 'What reports can HR access?',
      answer: 'Employee-wise consumption, department-wise costs, subsidy utilization, popular items, daily footfall, and custom reports. Auto-email to HR monthly.'
    },
  ];

  const relatedIndustries = [
    { name: 'Food Courts', href: '/for/food-courts' },
    { name: 'Cloud Kitchens', href: '/for/cloud-kitchens' },
    { name: 'Catering', href: '/for/catering' },
    { name: 'QSR', href: '/for/qsr' },
  ];

  return (
    <IndustryPageTemplate
      industry="Canteens & Cafeterias"
      heroTitle="POS Built for"
      heroHighlight="Canteens"
      heroDescription="Corporate offices, factories, schools, hospitals - DineOpen powers canteens with prepaid cards, subsidy management, and lightning-fast billing for hundreds of meals daily."
      painPoints={painPoints}
      benefits={benefits}
      testimonial={testimonial}
      faqs={faqs}
      ctaTitle="Ready to Modernize Your Canteen?"
      ctaDescription="Join leading corporates and institutions using DineOpen for canteen management."
      relatedIndustries={relatedIndustries}
    />
  );
}
