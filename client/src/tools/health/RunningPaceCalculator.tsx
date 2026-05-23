import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Running Pace Calculator',
  subtitle: 'Calculate running pace and predict finish time.',
  formula: `Pace = total time ÷ distance. Kilometer and mile distances are supported.`,
  fields: [{ key: 'unit', label: 'Distance unit', type: 'select', options: [{ value: 'km', label: 'Kilometers' }, { value: 'mi', label: 'Miles' }], defaultValue: 'km' }, { key: 'distance', label: 'Distance', type: 'number', unit: 'km/mi', defaultValue: '' }, { key: 'minutes', label: 'Time', type: 'number', unit: 'minutes', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const pace=n('minutes')/n('distance'); const km=values.unit==='mi'?n('distance')*1.60934:n('distance'); return out(`${fmt(pace,2)} min/${values.unit}`, [['Pace',`${fmt(pace,2)} min/${values.unit}`],['5K prediction',`${fmt(pace*(values.unit==='mi'?3.10686:5),1)} min`],['Marathon prediction',`${fmt((n('minutes')/km)*42.195,1)} min`]]);
  }
};
export default function RunningPaceCalculator() { return <HltToolShell definition={definition} />; }
