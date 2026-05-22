import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Fat Loss Calculator',
  subtitle: 'Estimate fat mass reduction needed for a target body-fat percentage.',
  formula: `Lean mass = weight × (1 − current body fat). Target weight = lean mass ÷ (1 − target body fat). Fat to lose is current weight minus target weight.`,
  fields: [{ key: 'weight', label: 'Current weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'bodyFat', label: 'Current body fat', type: 'number', unit: '%', defaultValue: '' }, { key: 'targetFat', label: 'Target body fat', type: 'number', unit: '%', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const lean=n('weight')*(1-n('bodyFat')/100); const target=lean/(1-n('targetFat')/100); const loss=n('weight')-target; return out(`${fmt(loss,1)} kg fat loss`, [['Current fat mass',`${fmt(n('weight')-lean,1)} kg`],['Estimated target weight',`${fmt(target,1)} kg`],['Time at 0.5 kg/week',`${fmt(loss/0.5,1)} weeks`]]);
  }
};
export default function FatLossCalculator() { return <HltToolShell definition={definition} />; }
