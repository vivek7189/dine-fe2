import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Lightspeed — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Lightspeed',
    color: '#ef4444',
    dineCost: '$1,068',
    theirCost: '~$7,400',
    hook: 'Enterprise POS at indie price (3 locations).',
  });
}
