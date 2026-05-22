import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Waist-to-Hip Ratio Calculator',
  subtitle: 'Calculate waist-to-hip ratio and show a simple health-risk category.',
  formula: `WHR = waist circumference ÷ hip circumference. Risk thresholds differ by sex: generally higher risk above 0.90 for men and 0.85 for women.`,
  fields: [{ key: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], defaultValue: 'male' }, { key: 'waist', label: 'Waist', type: 'number', unit: 'cm', defaultValue: '' }, { key: 'hip', label: 'Hip', type: 'number', unit: 'cm', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const r=n('waist')/n('hip'); const high=values.sex==='male'?0.9:0.85; const cat=r>=high?'Higher cardiometabolic risk':'Lower relative risk'; return out(`${fmt(r,2)} WHR`, [['Waist-to-hip ratio',fmt(r,2)],['Risk category',cat],['Waist minus hip',`${fmt(n('waist')-n('hip'),1)} cm`]]);
  }
};
export default function WaistToHipRatioCalculator() { return <HltToolShell definition={definition} />; }
