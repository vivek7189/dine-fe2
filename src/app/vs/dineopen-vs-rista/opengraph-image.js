import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Rista: honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Rista',
    color: '#14b8a6',
    dineCost: '₹10,788',
    theirCost: 'On request',
    hook: 'Price, Swiggy/Zomato sync and multi-brand kitchens.',
  });
}
