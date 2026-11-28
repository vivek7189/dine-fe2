import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Square for Restaurants — honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Square',
    color: '#10b981',
    dineCost: '$600',
    theirCost: '$948',
    hook: 'A year of software with a kitchen display (Growth vs Plus + 1 KDS).',
  });
}
