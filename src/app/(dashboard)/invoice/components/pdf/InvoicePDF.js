'use client';

import { Document } from '@react-pdf/renderer';
import StandardTemplate from './templates/StandardTemplate';
import ModernTemplate from './templates/ModernTemplate';
import BoldTemplate from './templates/BoldTemplate';
import ElegantTemplate from './templates/ElegantTemplate';
import SpreadsheetTemplate from './templates/SpreadsheetTemplate';
import CompactTemplate from './templates/CompactTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

const TEMPLATES = {
  standard: StandardTemplate,
  modern: ModernTemplate,
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  spreadsheet: SpreadsheetTemplate,
  compact: CompactTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
};

export function InvoicePDF({ data, type = 'invoice', org = {}, colors = {}, template = 'standard' }) {
  const TemplateComponent = TEMPLATES[template] || TEMPLATES.standard;

  return (
    <Document>
      <TemplateComponent data={data} type={type} org={org} colors={colors} />
    </Document>
  );
}
