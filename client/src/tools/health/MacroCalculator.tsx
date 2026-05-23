import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Macro Calculator',
  subtitle: 'Convert calorie targets into protein, carbohydrate, and fat grams.',
  formula: `Macro grams use 4 kcal/g for protein and carbohydrate, and 9 kcal/g for fat. Ratios vary by goal.`,
  fields: [{ key: 'calories', label: 'Daily calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'goal', label: 'Goal', type: 'select', options: [{ value: 'loss', label: 'Fat loss' }, { value: 'gain', label: 'Muscle gain' }, { value: 'maintain', label: 'Maintain' }], defaultValue: 'loss' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const ratios=values.goal==='gain'?[.25,.5,.25]:values.goal==='maintain'?[.25,.45,.30]:[.35,.35,.30]; return out(`${fmt(n('calories'),0)} kcal macro plan`, [['Protein',`${fmt(n('calories')*ratios[0]/4,0)} g`],['Carbs',`${fmt(n('calories')*ratios[1]/4,0)} g`],['Fat',`${fmt(n('calories')*ratios[2]/9,0)} g`]]);
  }
};
export default function MacroCalculator() { return <HltToolShell definition={definition} />; }
