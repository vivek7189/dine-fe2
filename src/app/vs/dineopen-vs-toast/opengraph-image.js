import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Toast — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Toast',
    color: '#f97316',
    dineCost: '$240',
    theirCost: '$828 + 2.49%',
    hook: 'Software cost, before card fees (Starter vs Point of Sale).',
  });
}
