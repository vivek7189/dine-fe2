import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Gofrugal: honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Gofrugal',
    color: '#f59e0b',
    dineCost: '₹9,588',
    theirCost: 'On request',
    hook: 'ERP-style inventory vs a simpler restaurant app.',
  });
}
