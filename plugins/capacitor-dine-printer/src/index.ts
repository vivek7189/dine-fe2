import { registerPlugin } from '@capacitor/core';
import type { DinePrinterPlugin } from './definitions';

const DinePrinter = registerPlugin<DinePrinterPlugin>('DinePrinter', {
  // Web fallback — uses window.print() as graceful degradation
  web: () => import('./web').then((m) => new m.DinePrinterWeb()),
});

export * from './definitions';
export { DinePrinter };
