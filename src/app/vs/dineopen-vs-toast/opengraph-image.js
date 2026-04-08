import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Toast — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Toast',
    color: '#f97316',
    dineCost: '$119.88',
    theirCost: '~$13,800',
    hook: 'The 2.49% swipe-fee tax nobody adds up.',
  });
}
