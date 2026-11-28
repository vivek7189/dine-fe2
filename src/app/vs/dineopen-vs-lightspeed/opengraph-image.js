import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Lightspeed — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Lightspeed',
    color: '#ef4444',
    dineCost: '$600',
    theirCost: 'from $2,268',
    hook: 'Growth plan vs Lightspeed from $189/month, one restaurant.',
  });
}
