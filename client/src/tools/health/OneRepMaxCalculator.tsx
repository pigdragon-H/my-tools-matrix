import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'One Rep Max Calculator',
  subtitle: 'Estimate one-rep max and training loads.',
  formula: `Epley: 1RM = weight × (1 + reps/30). Brzycki: 1RM = weight × 36 ÷ (37 − reps).`,
  fields: [{ key: 'weight', label: 'Weight lifted', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'reps', label: 'Repetitions', type: 'number', unit: 'reps', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const e=n('weight')*(1+n('reps')/30); const b=n('weight')*36/(37-n('reps')); const one=(e+b)/2; return out(`${fmt(one,1)} kg`, [['Estimated 1RM',`${fmt(one,1)} kg`],['Hypertrophy 70%',`${fmt(one*.7,1)} kg`],['Strength 85%',`${fmt(one*.85,1)} kg`]]);
  }
};
export default function OneRepMaxCalculator() { return <HltToolShell definition={definition} />; }
