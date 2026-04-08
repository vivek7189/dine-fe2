import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs TouchBistro — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'TouchBistro',
    color: '#06b6d4',
    dineCost: '$119.88',
    theirCost: '$2,988',
    hook: 'The per-iPad license tax adds up fast.',
  });
}
