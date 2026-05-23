import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Body Surface Area Calculator',
  subtitle: 'Estimate body surface area with the Du Bois medical formula.',
  formula: `Du Bois formula: BSA = 0.007184 × height(cm)^0.725 × weight(kg)^0.425. BSA is used in some clinical dosing and physiology contexts.`,
  fields: [{ key: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const bsa=0.007184*Math.pow(n('height'),0.725)*Math.pow(n('weight'),0.425); return out(`${fmt(bsa,2)} m²`, [['Body surface area',`${fmt(bsa,2)} m²`],['Chemotherapy context','Dosing may reference BSA'],['Cardiac index context','Output indexed by BSA']]);
  }
};
export default function BodySurfaceAreaCalculator() { return <HltToolShell definition={definition} />; }
