import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Vitamin D Calculator',
  subtitle: 'Estimate vitamin D intake guidance from age, weight, and sun exposure.',
  formula: `A practical educational estimate starts near 600–800 IU/day and increases with low sun exposure or higher body weight.`,
  fields: [{ key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'sun', label: 'Daily sun exposure', type: 'number', unit: 'minutes', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    let iu=n('age')>=70?800:600; if(n('sun')<15) iu+=400; if(n('weight')>90) iu+=200; const risk=n('sun')<10?'Higher deficiency risk':'Moderate/typical risk'; return out(`${fmt(iu,0)} IU/day`, [['Suggested vitamin D',`${fmt(iu,0)} IU/day`],['Deficiency risk',risk],['Sun exposure entered',`${fmt(n('sun'),0)} min/day`]]);
  }
};
export default function VitaminDCalculator() { return <HltToolShell definition={definition} />; }
