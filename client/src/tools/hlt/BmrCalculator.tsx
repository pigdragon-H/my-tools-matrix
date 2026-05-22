import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'BMR Calculator',
  subtitle: 'BMR using Mifflin-St Jeor with metric/imperial support.',
  formula: `BMR = 10×kg + 6.25×cm − 5×age + s, where s is +5 for men and −161 for women. Imperial inputs are converted before calculation.`,
  fields: [{ key: 'unit', label: 'Unit', type: 'select', options: [{ value: 'metric', label: 'Metric' }, { value: 'imperial', label: 'Imperial' }], defaultValue: 'metric' }, { key: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], defaultValue: 'male' }, { key: 'age', label: 'Age', type: 'number', defaultValue: '' }, { key: 'height', label: 'Height', type: 'number', unit: 'cm / in', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg / lb', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const kg=values.unit==='imperial'?n('weight')*0.453592:n('weight'); const cm=values.unit==='imperial'?n('height')*2.54:n('height'); const b=10*kg+6.25*cm-5*n('age')+(values.sex==='male'?5:-161); return out(`${fmt(b,0)} kcal/day`, [['BMR',`${fmt(b,0)} kcal/day`],['Estimated maintenance if sedentary',`${fmt(b*1.2,0)} kcal/day`],['Input weight',`${fmt(kg,1)} kg`]]);
  }
};
export default function BmrCalculator() { return <HltToolShell definition={definition} />; }
