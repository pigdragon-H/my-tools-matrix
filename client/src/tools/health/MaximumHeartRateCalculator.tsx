import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Maximum Heart Rate Calculator',
  subtitle: 'Estimate maximum heart rate and common exercise intensity zones.',
  formula: `Classic estimate: MHR = 220 − age. Tanaka comparison: MHR = 208 − 0.7 × age. Zones are percentages of estimated MHR.`,
  fields: [{ key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const m=220-n('age'); const t=208-0.7*n('age'); return out(`${fmt(m,0)} bpm`, [['Maximum heart rate',`${fmt(m,0)} bpm`],['Tanaka estimate',`${fmt(t,0)} bpm`],['Moderate zone',`${fmt(m*.5,0)}–${fmt(m*.7,0)} bpm`],['Vigorous zone',`${fmt(m*.7,0)}–${fmt(m*.85,0)} bpm`]]);
  }
};
export default function MaximumHeartRateCalculator() { return <HltToolShell definition={definition} />; }
