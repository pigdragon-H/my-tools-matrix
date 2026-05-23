import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Protein Intake Calculator',
  subtitle: 'Estimate daily protein needs from body weight, activity, and goal.',
  formula: `Protein target = body weight × goal/activity factor. Typical ranges are about 1.2–2.2 g/kg depending on training and goals.`,
  fields: [{ key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'activity', label: 'Activity', type: 'select', options: [{ value: '1.2', label: 'Low' }, { value: '1.6', label: 'Moderate' }, { value: '2.0', label: 'High training' }, { value: '2.2', label: 'Muscle gain/cut' }], defaultValue: '1.6' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const p=n('weight')*Number(values.activity); return out(`${fmt(p,0)} g/day`, [['Daily protein',`${fmt(p,0)} g`],['Per meal across 4 meals',`${fmt(p/4,0)} g`],['Food examples','eggs, fish, tofu, Greek yogurt, legumes']]);
  }
};
export default function ProteinIntakeCalculator() { return <HltToolShell definition={definition} />; }
