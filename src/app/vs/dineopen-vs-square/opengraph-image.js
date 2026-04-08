import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Square — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Square',
    color: '#10b981',
    dineCost: '$119.88',
    theirCost: '~$13,440',
    hook: '"Free POS" with a 2.6% tax on every swipe.',
  });
}
