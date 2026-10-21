import { makeVsImage } from '../_ogTemplate';
export { size, contentType } from '../_ogTemplate';
export const alt = 'DineOpen vs Foodics: honest comparison';
export default function Image() {
  return makeVsImage({
    competitor: 'Foodics',
    color: '#a78bfa',
    dineCost: 'AED 900',
    theirCost: 'AED 2,388',
    hook: 'UAE Starter plans compared. Saudi ZATCA: pick Foodics.',
  });
}
