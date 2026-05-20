import { registerPlugin } from '@capacitor/core';
const DinePrinter = registerPlugin('DinePrinter', {
  web: () => import('./web').then((m) => new m.DinePrinterWeb()),
});
export * from './definitions';
export { DinePrinter };
