import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'VO2 Max Calculator',
  subtitle: 'Estimate VO2 max from a Cooper 12-minute run test.',
  formula: `Cooper formula: VO2 max = (distance in meters − 504.9) ÷ 44.73.`,
  fields: [{ key: 'distance', label: '12-minute run distance', type: 'number', unit: 'meters', defaultValue: '' }, { key: 'age', label: 'Age', type: 'number', unit: 'years', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const vo2=(n('distance')-504.9)/44.73; const level=vo2>=50?'Excellent':vo2>=40?'Good':vo2>=30?'Fair':'Needs improvement'; return out(`${fmt(vo2,1)} ml/kg/min`, [['VO2 max',`${fmt(vo2,1)} ml/kg/min`],['Aerobic level',level],['Distance entered',`${fmt(n('distance'),0)} m`]]);
  }
};
export default function Vo2MaxCalculator() { return <HltToolShell definition={definition} />; }
