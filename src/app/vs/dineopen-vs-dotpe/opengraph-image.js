import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs DotPe: honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'DotPe',
    color: '#60a5fa',
    dineCost: '₹9,588',
    theirCost: 'On request',
    hook: 'QR ordering, payments and who each one suits.',
  });
}
