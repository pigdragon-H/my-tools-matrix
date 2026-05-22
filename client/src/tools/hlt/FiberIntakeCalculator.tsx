import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Fiber Intake Calculator',
  subtitle: 'Estimate daily fiber recommendation from age, sex, and calories.',
  formula: `Common guidance is about 14 g fiber per 1,000 kcal, with adult reference values often near 25 g/day for women and 38 g/day for men.`,
  fields: [{ key: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], defaultValue: 'female' }, { key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }, { key: 'calories', label: 'Calories', type: 'number', unit: 'kcal/day', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const byCal=n('calories')/1000*14; const ref=values.sex==='male'?(n('age')>50?30:38):(n('age')>50?21:25); return out(`${fmt(Math.max(byCal,ref),0)} g/day`, [['Calorie-based fiber',`${fmt(byCal,0)} g`],['Reference target',`${fmt(ref,0)} g`],['Food sources','beans, oats, berries, vegetables, whole grains']]);
  }
};
export default function FiberIntakeCalculator() { return <HltToolShell definition={definition} />; }
