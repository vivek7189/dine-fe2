'use client';

import ToolPageTemplate from '../../../components/ToolPageTemplate';
import { FaFileInvoice, FaCalculator, FaPrint, FaWhatsapp, FaRupeeSign, FaHistory } from 'react-icons/fa';

export default function InvoiceGeneratorClient() {
  const features = [
    {
      icon: FaCalculator,
      title: 'Automatic GST Calculation',
      description: 'Set your GST rates once. Taxes calculate automatically on every bill. No manual math errors.'
    },
    {
      icon: FaFileInvoice,
      title: 'GST-Compliant Format',
      description: 'Invoices include GSTIN, HSN codes, tax breakdowns - everything needed for compliance.'
    },
    {
      icon: FaPrint,
      title: 'Print-Ready Bills',
      description: 'Works with standard thermal printers. Clean, professional bills print in seconds.'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp Receipts',
      description: 'Send digital receipts directly to customers via WhatsApp. Eco-friendly and convenient.'
    },
    {
      icon: FaRupeeSign,
      title: 'Multiple Payment Modes',
      description: 'Record cash, UPI, card, or split payments. Track all payment types in one place.'
    },
    {
      icon: FaHistory,
      title: 'Invoice History',
      description: 'Access past invoices anytime. Search by date, amount, or customer. Perfect for returns.'
    },
  ];

  const howItWorks = [
    {
      title: 'Set Up Your Restaurant',
      description: 'Enter your restaurant details, GSTIN, address, and configure GST rates for your items.'
    },
    {
      title: 'Add Items to Bill',
      description: 'Select items from your menu or quick-add. System calculates totals and taxes automatically.'
    },
    {
      title: 'Apply Discounts (Optional)',
      description: 'Add percentage or flat discounts. Taxes recalculate automatically after discounts.'
    },
    {
      title: 'Generate & Share Invoice',
      description: 'Print the bill or send via WhatsApp. Invoice saved to history for future reference.'
    },
  ];

  const benefits = [
    'GST-compliant invoices automatically',
    'Zero calculation errors',
    'Digital receipts save paper',
    'Track all payment modes',
    'Access invoice history anytime',
    'Professional branded bills'
  ];

  const faqs = [
    {
      question: 'Is the invoice generator GST compliant?',
      answer: 'Yes! Invoices include all required fields - GSTIN, HSN codes, CGST/SGST breakdowns, and proper formatting as per GST guidelines.'
    },
    {
      question: 'Can I customize the invoice with my logo?',
      answer: 'Yes, add your restaurant logo, name, address, and contact details. Your bills look professional and branded.'
    },
    {
      question: 'Does it work with thermal printers?',
      answer: 'Yes! Optimized for 80mm and 58mm thermal printers commonly used in restaurants. Clean formatting guaranteed.'
    },
    {
      question: 'Can I send bills via WhatsApp?',
      answer: 'Absolutely. Generate a digital receipt and share directly to customer WhatsApp. Great for delivery orders.'
    },
    {
      question: 'How do I handle split payments?',
      answer: 'Record multiple payment modes for a single bill - part cash, part UPI, part card. System tracks all splits.'
    },
  ];

  const relatedTools = [
    { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
    { name: 'KOT System', href: '/tools/kot-system' },
    { name: 'Table Management', href: '/tools/table-management' },
    { name: 'Loyalty Program', href: '/tools/loyalty-program' },
  ];

  return (
    <ToolPageTemplate
      toolName="Invoice Generator"
      toolIcon={FaFileInvoice}
      heroTitle="GST-Ready Restaurant"
      heroHighlight="Bills in Seconds"
      heroDescription="Generate professional, GST-compliant invoices for your restaurant instantly. Automatic tax calculation, thermal printer ready, and WhatsApp sharing - all free."
      features={features}
      howItWorks={howItWorks}
      benefits={benefits}
      faqs={faqs}
      ctaTitle="Start Generating Invoices"
      ctaDescription="Create professional restaurant bills instantly. Free to use, GST-compliant guaranteed."
      relatedTools={relatedTools}
    />
  );
}
