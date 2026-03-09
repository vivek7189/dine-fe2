import RecipeScalerClient from './RecipeScalerClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Recipe Scaler Calculator [Free] — Scale Ingredients Up or Down | DineOpen',
  description: 'Free recipe scaler for restaurants. Scale any recipe up or down instantly. Enter ingredients and servings, get scaled quantities. No login required.',
  keywords: 'recipe scaler, recipe scaler calculator, recipe multiplier, scale recipe up, recipe converter, restaurant recipe calculator, batch recipe calculator',
  openGraph: {
    title: 'Recipe Scaler Calculator [Free] | DineOpen',
    description: 'Scale any recipe up or down instantly. Free recipe multiplier for restaurants.',
    url: 'https://www.dineopen.com/tools/recipe-scaler',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/recipe-scaler' },
};

export default function RecipeScalerPage() {
  return <RecipeScalerClient />;
}
