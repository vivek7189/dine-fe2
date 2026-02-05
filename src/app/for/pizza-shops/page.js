import PizzaShopsClient from './PizzaShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Pizza Shops | Toppings, Combos, Delivery | DineOpen',
  description: 'Best POS for pizza shops and pizzerias. Manage toppings, half-half pizzas, combo deals, delivery zones. Domino\'s style order tracking. Reduce order errors.',
  keywords: 'pizza shop POS, pizzeria software, pizza delivery POS, pizza topping management, pizza combo software, pizza order tracking, pizza restaurant POS India',
  openGraph: {
    title: 'POS Software for Pizza Shops | DineOpen',
    description: 'Specialized POS for pizza shops with topping management, combo deals, and delivery tracking.',
    url: 'https://www.dineopen.com/for/pizza-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/pizza-shops',
  },
};

export default function PizzaShopsPage() {
  return <PizzaShopsClient />;
}
