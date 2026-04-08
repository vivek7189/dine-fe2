import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Clover — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Clover',
    color: '#6366f1',
    dineCost: '$119.88',
    theirCost: '~$13,829',
    hook: '$1,349 hardware lock-in + Fiserv processor.',
  });
}
