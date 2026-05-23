import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Intermittent Fasting Calculator',
  subtitle: 'Calculate fasting and eating windows.',
  formula: `Plans use fasting:eating hour patterns such as 16:8 or 18:6. The eating window starts at the chosen first meal time.`,
  fields: [{ key: 'plan', label: 'Fasting plan', type: 'select', options: [{ value: '16', label: '16:8' }, { value: '18', label: '18:6' }, { value: '24', label: '5:2 fasting day' }], defaultValue: '16' }, { key: 'start', label: 'Eating starts', type: 'time', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const [h,m]=values.start.split(':').map(Number); const fast=Number(values.plan); const eat=24-fast; const end=(h+eat)%24; return out(`${eat}-hour eating window`, [['Eating window',`${values.start} to ${String(end).padStart(2,'0')}:${String(m).padStart(2,'0')}`],['Fasting duration',`${fast} hours`],['Plan type',fast===24?'5:2 fasting day':`${fast}:${eat}`]]);
  }
};
export default function IntermittentFastingCalculator() { return <HltToolShell definition={definition} />; }
