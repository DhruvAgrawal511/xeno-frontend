import { useState, useEffect } from 'react';

const FIELDS = [
  { value: 'total_spend', label: 'Total Spend' },
  { value: 'visits', label: 'Visits' },
];
const CMPS = [
  { value: 'gt', label: '>' }, { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' }, { value: 'lte', label: '<=' },
  { value: 'eq', label: '=' }, { value: 'ne', label: '!=' },
];

function ConditionRow({ condition, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...condition, [k]: v });
  return (
    <div className="row" style={{ alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <label>Field</label>
        <select className="input" value={condition.field} onChange={e => set('field', e.target.value)}>
          <option value="">Select field</option>
          {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>
      <div style={{ width: 120 }}>
        <label>Compare</label>
        <select className="input" value={condition.cmp} onChange={e => set('cmp', e.target.value)}>
          <option value="">Op</option>
          {CMPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label>Value</label>
        <input className="input" type="number" value={condition.value ?? ''} onChange={e => set('value', Number(e.target.value))} />
      </div>
      <div>
        <label>&nbsp;</label>
        <button type="button" className="btn danger" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

export default function RuleBuilder({ value, onChange }) {
  const [op, setOp] = useState(value?.op || 'AND');
  const [rows, setRows] = useState(
    value?.children?.length ? value.children : [{ field: 'total_spend', cmp: 'gte', value: 0 }]
  );

  const add = () => setRows(r => [...r, { field: 'total_spend', cmp: 'gte', value: 0 }]);
  const updateRow = (idx, v) => setRows(r => r.map((x, i) => (i === idx ? v : x)));
  const remove = (idx) => setRows(r => r.filter((_, i) => i !== idx));

  // ✅ Only notify parent when op/rows actually change
  useEffect(() => {
    onChange?.({ op, children: rows });
  }, [op, rows, onChange]);

  return (
    <div className="card">
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div>
          <label>Combine conditions with</label>
          <select className="input" value={op} onChange={e => setOp(e.target.value)}>
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        <div>
          <label>&nbsp;</label>
          <button type="button" className="btn" onClick={add}>+ Add Condition</button>
        </div>
      </div>
      <div style={{ height: 8 }} />
      {rows.map((c, i) => (
        <ConditionRow key={i} condition={c} onChange={v => updateRow(i, v)} onRemove={() => remove(i)} />
      ))}
      <small className="muted">Tip: start with <span className="kbd">total_spend ≥ 0</span> to match everyone.</small>
    </div>
  );
}
