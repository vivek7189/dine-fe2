'use client';

import ToolPageTemplate from '../../../components/ToolPageTemplate';
import { FaGift, FaStar, FaBirthdayCake, FaWhatsapp, FaUsers, FaChartLine } from 'react-icons/fa';

export default function LoyaltyProgramClient() {
  const features = [
    {
      icon: FaStar,
      title: 'Points Per Purchase',
      description: 'Customers earn points on every order. Configurable rates - 1 point per Rs 10 or custom rules.'
    },
    {
      icon: FaGift,
      title: 'Redeem for Rewards',
      description: 'Customers redeem points for discounts, free items, or exclusive rewards you define.'
    },
    {
      icon: FaBirthdayCake,
      title: 'Birthday Offers',
      description: 'Automatic birthday wishes with special offers. Bring customers back on their special day.'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp Engagement',
      description: 'Send points updates, reward notifications, and special offers directly via WhatsApp.'
    },
    {
      icon: FaUsers,
      title: 'Customer Database',
      description: 'Build your customer list with contact details, order history, and preferences.'
    },
    {
      icon: FaChartLine,
      title: 'Loyalty Analytics',
      description: 'See redemption rates, top customers, and program performance. Optimize for results.'
    },
  ];

  const howItWorks = [
    {
      title: 'Set Up Your Program',
      description: 'Define points earning rate, reward options, and special occasions like birthdays.'
    },
    {
      title: 'Customers Join',
      description: 'Customers sign up with phone number when ordering. Instant enrollment, no forms.'
    },
    {
      title: 'Earn Points Automatically',
      description: 'Every order earns points. Customers see balance on receipts and via WhatsApp.'
    },
    {
      title: 'Redeem & Return',
      description: 'Customers redeem points for rewards. They return more often. You build loyal regulars.'
    },
  ];

  const benefits = [
    'Turn one-time visitors into regulars',
    'Increase customer lifetime value',
    'Birthday automation brings them back',
    'Build your own customer database',
    'Reduce dependence on aggregators',
    'Measure loyalty program ROI'
  ];

  const faqs = [
    {
      question: 'How do customers join the loyalty program?',
      answer: 'Simple! They provide their phone number when placing an order. Instantly enrolled, points start earning. No apps to download.'
    },
    {
      question: 'Can I customize the points rate?',
      answer: 'Yes. Set any rate - 1 point per Rs 10, 2 points per Rs 100, or custom rules for different categories.'
    },
    {
      question: 'What kind of rewards can I offer?',
      answer: 'Anything! Percentage discounts, flat off, free menu items, or exclusive dishes. You define the reward catalog.'
    },
    {
      question: 'How do birthday offers work?',
      answer: 'Store customer birthdays. System automatically sends birthday wishes with a special offer via WhatsApp before their birthday.'
    },
    {
      question: 'Can I see who my best customers are?',
      answer: 'Yes! Analytics show top customers by visits, spending, and points. Identify your VIPs and treat them special.'
    },
  ];

  const relatedTools = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
    { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator' },
    { name: 'KOT System', href: '/tools/kot-system' },
    { name: 'Table Management', href: '/tools/table-management' },
  ];

  return (
    <ToolPageTemplate
      toolName="Loyalty Program"
      toolIcon={FaGift}
      heroTitle="Turn Visitors Into"
      heroHighlight="Loyal Regulars"
      heroDescription="Build your customer database and reward them for coming back. Points, rewards, birthday offers, and WhatsApp engagement - create fans who keep returning."
      features={features}
      howItWorks={howItWorks}
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Start Building Customer Loyalty"
      ctaDescription="Every restaurant needs regulars. Start your loyalty program free today."
      relatedTools={relatedTools}
    />
  );
}
