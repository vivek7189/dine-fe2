import BreakEvenCalculatorClient from './BreakEvenCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Break-Even Calculator | Know Your Numbers | DineOpen',
  description: 'Calculate how many customers or sales you need to break even. Free break-even analysis tool for restaurants, cafes, food trucks, and food businesses worldwide. Plan your profitability.',
  keywords: 'break even calculator, restaurant break even, break even analysis, restaurant profitability calculator, how many customers to break even, restaurant business calculator, cafe break even point, food truck break even, restaurant break even UK, restaurant break even India, restaurant fixed costs, contribution margin calculator, restaurant financial planning, break even point formula',
  openGraph: {
    title: 'Free Restaurant Break-Even Calculator | DineOpen',
    description: 'Calculate your break-even point. Know how many customers or sales you need to cover costs and start making profit.',
    url: 'https://www.dineopen.com/tools/break-even-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/break-even-calculator',
  },
};

export default function BreakEvenCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant Break-Even Calculator",
    "description": "Calculate your restaurant's break-even point and plan for profitability. Supports USD, GBP, INR, EUR, AED, CAD, AUD, SGD.",
    "url": "https://www.dineopen.com/tools/break-even-calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the break-even point for a restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The break-even point is when your total revenue equals your total costs (fixed + variable). At this point, you are neither making a profit nor incurring a loss. For restaurants, it is typically measured as the number of orders or customers needed per month to cover all expenses including rent, salaries, utilities, food costs, and other overhead."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take a restaurant to break even?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most restaurants take 3 to 5 years to fully break even on their initial investment. However, monthly operational break-even (covering monthly costs from monthly revenue) can happen within 6 to 18 months for well-managed restaurants. Fast-casual and food truck concepts often break even faster due to lower overhead."
        }
      },
      {
        "@type": "Question",
        "name": "What are typical fixed costs for a restaurant?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fixed costs vary widely by format and location. A small cafe might have $8,000 to $15,000 per month in fixed costs, while a full-service restaurant could be $25,000 to $50,000 or more. Common fixed costs include rent or mortgage, salaried staff wages, insurance, loan payments, licenses, and software subscriptions."
        }
      },
      {
        "@type": "Question",
        "name": "How does average order value affect break-even?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Average order value directly impacts how many orders you need to break even. A higher average order means each customer contributes more toward covering your fixed costs. Strategies like upselling, combo meals, dessert menus, and premium add-ons can increase your average order value and significantly reduce the number of orders needed to break even."
        }
      },
      {
        "@type": "Question",
        "name": "How can technology help reach break-even faster?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "POS systems, online ordering, and restaurant management software help you reach break-even faster by reducing labor costs, minimizing order errors, tracking food waste, optimizing inventory, and increasing average order values through smart upselling. Analytics dashboards also help you identify your most and least profitable items so you can optimize your menu."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://www.dineopen.com/tools/food-cost-calculator" },
      { "@type": "ListItem", "position": 3, "name": "Break-Even Calculator", "item": "https://www.dineopen.com/tools/break-even-calculator" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BreakEvenCalculatorClient />
    </>
  );
}
