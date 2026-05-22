import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Calorie Calculator',
  subtitle: 'Estimate daily calories from personal data and show macro distribution.',
  formula: `Uses Mifflin-St Jeor BMR multiplied by activity factor, then splits calories into protein, carbohydrate, and fat targets.`,
  fields: [{ key: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], defaultValue: 'male' }, { key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }, { key: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'activity', label: 'Activity', type: 'select', options: [{ value: '1.2', label: 'Sedentary' }, { value: '1.375', label: 'Light' }, { value: '1.55', label: 'Moderate' }, { value: '1.725', label: 'High' }], defaultValue: '1.55' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const b=10*n('weight')+6.25*n('height')-5*n('age')+(values.sex==='male'?5:-161); const c=b*Number(values.activity); return out(`${fmt(c,0)} kcal/day`, [['Protein 25%',`${fmt(c*.25/4,0)} g`],['Carbs 45%',`${fmt(c*.45/4,0)} g`],['Fat 30%',`${fmt(c*.30/9,0)} g`]]);
  }
};
export default function CalorieCalculator() { return <HltToolShell definition={definition} />; }
