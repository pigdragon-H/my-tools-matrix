import React from 'react';
import HltToolShell, { HltToolDefinition, fmt, num } from '../HltToolShell';
const definition: HltToolDefinition = {
  title: 'Body Weight Planner',
  subtitle: 'Build weekly milestones from current and target body weight.',
  formula: `Weekly change = (target weight − current weight) ÷ number of weeks. Milestones are linear planning estimates.`,
  fields: [{ key: 'current', label: 'Current weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'target', label: 'Target weight', type: 'number', unit: 'kg', defaultValue: '' }, { key: 'weeks', label: 'Timeline', type: 'number', unit: 'weeks', defaultValue: '' }],
  compute: (values) => {
    const n = (k: string) => num(values, k);
    const out = (summary: string, rows: Array<[string, string]>) => ({ summary, metrics: rows.map(([label, value]) => ({ label, value })) });
    const change=(n('target')-n('current'))/n('weeks'); return out(`${fmt(Math.abs(change),2)} kg/week`, [['Weekly change needed',`${fmt(change,2)} kg/week`],['Week 4 milestone',`${fmt(n('current')+change*Math.min(4,n('weeks')),1)} kg`],['Halfway milestone',`${fmt((n('current')+n('target'))/2,1)} kg`]]);
  }
};
export default function BodyWeightPlanner() { return <HltToolShell definition={definition} />; }
