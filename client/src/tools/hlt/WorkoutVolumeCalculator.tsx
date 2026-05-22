import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Workout Volume Calculator',
  subtitle: 'Calculate session and weekly training volume.',
  formula: `Training volume = sets × reps × weight. Weekly volume multiplies session volume by sessions per week.`,
  fields: [{ key: 'sets', label: 'Sets', type: 'number', unit: 'sets', defaultValue: '' }, { key: 'reps', label: 'Reps', type: 'number', unit: 'reps', defaultValue: '' }, { key: 'weight', label: 'Weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'sessions', label: 'Sessions per week', type: 'number', unit: '/week', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const s=n('sets')*n('reps')*n('weight'); return out(`${fmt(s,0)} kg session volume`, [['Session volume',`${fmt(s,0)} kg`],['Weekly volume',`${fmt(s*n('sessions'),0)} kg`],['Total weekly reps',fmt(n('sets')*n('reps')*n('sessions'),0)]]);
  }
};
export default function WorkoutVolumeCalculator() { return <HltToolShell definition={definition} />; }
