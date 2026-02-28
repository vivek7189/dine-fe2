'use client';

import ToolPageTemplate from '../../../components/ToolPageTemplate';
import { FaQrcode, FaImage, FaMobile, FaPalette, FaLanguage, FaSync } from 'react-icons/fa';

export default function QRMenuGeneratorClient() {
  const features = [
    {
      icon: FaQrcode,
      title: 'Unique QR Per Table',
      description: 'Generate unique QR codes for each table. Customers scan and orders are tagged to the right table.'
    },
    {
      icon: FaImage,
      title: 'Menu with Photos',
      description: 'Upload photos for each dish. Visual menus increase orders by 30% compared to text-only menus.'
    },
    {
      icon: FaPalette,
      title: '5 Beautiful Themes',
      description: 'Choose from Classic, Carousel, Cube, Book, or Bistro themes to match your restaurant style.'
    },
    {
      icon: FaMobile,
      title: 'No App Required',
      description: 'Customers just scan with their phone camera. No app download, no signup needed to view menu.'
    },
    {
      icon: FaLanguage,
      title: 'Multi-Language Support',
      description: 'Menu available in English and Hindi. Customers can switch language preference.'
    },
    {
      icon: FaSync,
      title: 'Real-Time Updates',
      description: 'Update prices, add items, mark out-of-stock - changes reflect instantly on all QR menus.'
    },
  ];

  const howItWorks = [
    {
      title: 'Add Your Menu Items',
      description: 'Enter your dishes with names, prices, descriptions, and photos. Set up categories, variants, and add-ons.'
    },
    {
      title: 'Choose Your Theme',
      description: 'Pick a menu theme that matches your restaurant brand. Customize colors and add your logo.'
    },
    {
      title: 'Generate QR Codes',
      description: 'Generate unique QR codes for each table or a single QR for your restaurant. Download and print.'
    },
    {
      title: 'Customers Scan & Order',
      description: 'Customers scan the QR, browse your beautiful menu, and place orders directly from their phones.'
    },
  ];

  const benefits = [
    'Zero paper menu printing costs',
    'Update menu instantly, no reprinting',
    'Higher average order value with photos',
    'Reduce order errors significantly',
    'Contactless, hygienic ordering',
    'Track which items are most viewed'
  ];

  const faqs = [
    {
      question: 'Is the QR menu generator really free?',
      answer: 'Yes, you can create and use QR menus for free with DineOpen. Advanced features like ordering and payments are part of the full platform.'
    },
    {
      question: 'Do customers need to download an app?',
      answer: 'No! Customers just scan the QR code with their phone camera and the menu opens in their browser. No app download or signup required.'
    },
    {
      question: 'Can I update the menu after printing QR codes?',
      answer: 'Yes! The QR code stays the same, but the menu it links to can be updated anytime. Change prices, add items, mark out-of-stock - all instant.'
    },
    {
      question: 'What menu themes are available?',
      answer: 'DineOpen offers 5 themes: Classic (clean list), Carousel (swipe cards), Cube (3D effect), Book (page flip), and Bistro (elegant grid).'
    },
    {
      question: 'Can I add photos to my menu?',
      answer: 'Absolutely! Upload photos for each dish. Menus with photos typically see 30% higher order values.'
    },
  ];

  const relatedTools = [
    { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator' },
    { name: 'KOT System', href: '/tools/kot-system' },
    { name: 'Table Management', href: '/tools/table-management' },
    { name: 'Loyalty Program', href: '/tools/loyalty-program' },
  ];

  return (
    <ToolPageTemplate
      toolName="QR Menu Generator"
      toolIcon={FaQrcode}
      heroTitle="Create Beautiful"
      heroHighlight="QR Menus for Free"
      heroDescription="Generate digital QR code menus for your restaurant in minutes. Customers scan, browse with photos, and order - all without downloading any app. Zero printing costs, instant updates."
      features={features}
      howItWorks={howItWorks}
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Create Your QR Menu Now"
      ctaDescription="Join thousands of restaurants using digital QR menus. Free to start, no credit card needed."
      relatedTools={relatedTools}
      currentPath="/tools/qr-menu-generator"
    />
  );
}
