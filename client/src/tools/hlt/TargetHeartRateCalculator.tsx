import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Target Heart Rate Calculator',
  subtitle: 'Calculate target heart-rate zone from age and intensity.',
  formula: `Target heart rate = (220 − age) × intensity percentage. A ±5% band is shown as a practical zone.`,
  fields: [{ key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }, { key: 'intensity', label: 'Intensity', type: 'number', unit: '%', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const max=220-n('age'); const mid=max*n('intensity')/100; return out(`${fmt(mid,0)} bpm`, [['Target heart rate',`${fmt(mid,0)} bpm`],['Practical zone',`${fmt(max*(n('intensity')-5)/100,0)}–${fmt(max*(n('intensity')+5)/100,0)} bpm`],['Estimated max',`${fmt(max,0)} bpm`]]);
  }
};
export default function TargetHeartRateCalculator() { return <HltToolShell definition={definition} />; }
