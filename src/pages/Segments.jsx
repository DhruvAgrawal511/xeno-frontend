import { useEffect, useState } from "react";
import API from "../api";

function parseList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.segments)) return res.segments;
  return [];
}

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [name, setName] = useState("");
  const [audience, setAudience] = useState(null);
  const [saving, setSaving] = useState(false);

  // very simple starting rule; your rule-builder can mutate this
  const [rules, setRules] = useState({
    op: "AND",
    children: [
      // Example: { field: "total_spend", cmp: "gte", value: 10000 }
    ],
  });

  async function load() {
    const res = await API.listSegments().catch(() => []);
    const list = parseList(res);
    setSegments(list.slice(0, 10));
  }
  useEffect(() => { load(); }, []);

  const preview = async () => {
    try {
      const r = await API.previewSegment(rules); // backend expects { rules }
      setAudience(r?.audienceSize ?? 0);
    } catch (e) {
      console.error(e);
      setAudience(0);
      alert("Preview failed");
    }
  };

  const save = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await API.createSegment(name, rules); // (name, rules)
      setName("");
      setAudience(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("Save failed: " + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Create Segment</h3>

        <div className="form grid-2" style={{ marginBottom: 8 }}>
          <div className="field">
            <label className="label">Segment Name</label>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="High Value Low Visits" />
          </div>
          <div className="field">
            <label className="label">Audience (preview)</label>
            <div className="actions" style={{ alignItems:'center' }}>
              <button type="button" className="btn" onClick={preview}>Preview</button>
              <span className="kbd">{audience ?? "-"}</span>
              <button type="button" className="btn primary" onClick={save} disabled={saving || !name}>
                {saving ? "Saving..." : "Save Segment"}
              </button>
            </div>
          </div>
        </div>

        {/* Minimal controls to append a basic rule; keep your own builder if you already have one */}
        <div className="form grid-3">
          <div className="field">
            <label className="label">Field</label>
            <select
              className="select"
              onChange={(e)=>{
                const v = e.target.value;
                setRules(r => ({ ...r, lastField: v }));
              }}>
              <option value="total_spend">total_spend</option>
              <option value="visits">visits</option>
              <option value="inactive_days">inactive_days</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Comparator</label>
            <select className="select" onChange={(e)=>setRules(r=>({ ...r, lastCmp: e.target.value }))}>
              <option value="gt">gt</option>
              <option value="gte">gte</option>
              <option value="lt">lt</option>
              <option value="lte">lte</option>
              <option value="eq">eq</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Value</label>
            <input className="input" type="number" onChange={(e)=>setRules(r=>({ ...r, lastVal: Number(e.target.value)||0 }))}/>
          </div>
          <div className="actions" style={{ gridColumn: '1 / -1' }}>
            <button
              type="button"
              className="btn"
              onClick={()=>{
                setRules(r => ({
                  op: r.op || "AND",
                  children: [
                    ...(r.children || []),
                    { field: r.lastField || "total_spend", cmp: r.lastCmp || "gte", value: r.lastVal ?? 0 }
                  ]
                }));
              }}
            >
              Add Rule
            </button>
          </div>
        </div>

        {/* Current rules preview */}
        <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
          Rules: {JSON.stringify(rules.children || [], null, 0)}
        </div>
      </div>

      <div className="card">
        <h3>Saved Segments</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Audience</th><th>Created</th></tr>
            </thead>
            <tbody>
              {segments.length ? segments.map(s=>(
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.audienceSize ?? "-"}</td>
                  <td>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</td>
                </tr>
              )) : <tr><td colSpan="3" className="muted">No segments yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Showing latest 10</div>
      </div>
    </div>
  );
}
