import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Macro Ratio Calculator',
  subtitle: 'Convert macro percentages into daily grams.',
  formula: `Protein and carbs provide 4 kcal/g; fat provides 9 kcal/g. Percentages should reflect the selected nutrition goal.`,
  fields: [{ key: 'calories', label: 'Total calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'proteinPct', label: 'Protein', type: 'number', unit: '%', defaultValue: '' }, { key: 'carbPct', label: 'Carbs', type: 'number', unit: '%', defaultValue: '' }, { key: 'fatPct', label: 'Fat', type: 'number', unit: '%', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const total=n('proteinPct')+n('carbPct')+n('fatPct'); return out(`${fmt(total,0)}% allocated`, [['Protein grams',`${fmt(n('calories')*n('proteinPct')/100/4,0)} g`],['Carb grams',`${fmt(n('calories')*n('carbPct')/100/4,0)} g`],['Fat grams',`${fmt(n('calories')*n('fatPct')/100/9,0)} g`]]);
  }
};
export default function MacroRatioCalculator() { return <HltToolShell definition={definition} />; }
