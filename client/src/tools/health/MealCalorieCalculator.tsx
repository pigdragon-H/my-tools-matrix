import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Meal Calorie Calculator',
  subtitle: 'Add calories and nutrients for up to three foods in one meal.',
  formula: `Meal total = sum of each food calories. Macro calories can be cross-checked as protein×4 + carbohydrate×4 + fat×9.`,
  fields: [{ key: 'cal1', label: 'Food 1 calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'cal2', label: 'Food 2 calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'cal3', label: 'Food 3 calories', type: 'number', unit: 'kcal', defaultValue: '' }, { key: 'protein', label: 'Protein', type: 'number', unit: 'g', defaultValue: '' }, { key: 'carbs', label: 'Carbs', type: 'number', unit: 'g', defaultValue: '' }, { key: 'fat', label: 'Fat', type: 'number', unit: 'g', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const total=n('cal1')+n('cal2')+n('cal3'); const macro=n('protein')*4+n('carbs')*4+n('fat')*9; return out(`${fmt(total,0)} kcal`, [['Meal calories',`${fmt(total,0)} kcal`],['Macro-derived calories',`${fmt(macro,0)} kcal`],['Protein / carbs / fat',`${fmt(n('protein'),0)}g / ${fmt(n('carbs'),0)}g / ${fmt(n('fat'),0)}g`]]);
  }
};
export default function MealCalorieCalculator() { return <HltToolShell definition={definition} />; }
