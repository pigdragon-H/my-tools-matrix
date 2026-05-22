import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Lean Body Mass Calculator',
  subtitle: 'Estimate lean mass from weight and body-fat percentage, with Boer comparison.',
  formula: `Primary method: LBM = body weight × (1 − body fat%). Boer equations provide a secondary sex-based clinical estimate from height and weight.`,
  fields: [{ key: 'sex', label: 'Sex', type: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], defaultValue: 'male' }, { key: 'height', label: 'Height', type: 'number', unit: 'cm', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'bodyFat', label: 'Body fat', type: 'number', unit: '%', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const lbm=n('weight')*(1-n('bodyFat')/100); const boer=values.sex==='male'?0.407*n('weight')+0.267*n('height')-19.2:0.252*n('weight')+0.473*n('height')-48.3; return out(`${fmt(lbm,1)} kg`, [['Lean body mass',`${fmt(lbm,1)} kg`],['Fat mass',`${fmt(n('weight')-lbm,1)} kg`],['Boer estimate',`${fmt(boer,1)} kg`]]);
  }
};
export default function LeanBodyMassCalculator() { return <HltToolShell definition={definition} />; }
