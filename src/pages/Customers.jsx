import { useEffect, useState } from "react";
import API from "../api";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function parseList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.customers)) return res.customers;
  return [];
}

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    total_spend: 0,
    visits: 0,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await API.listCustomers(1, 200);
      const list = parseList(res);
      setRows(list);
      console.log("[Customers] loaded", { length: list.length });
    } catch (e) {
      console.error(e);
      setLoadErr(e.message || "Failed to load customers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.createCustomer(form); // POST /api/customers
      setForm({ name: "", email: "", phone: "", total_spend: 0, visits: 0 });
      await load();
    } catch (e2) {
      console.error(e2);
      alert("Failed to queue customer: " + (e2.message || e2));
    } finally {
      setSaving(false);
    }
  };

  const recent = rows.slice(0, 10);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Add Customer</h3>
        <form className="form grid-3" onSubmit={submit}>
          <div className="field">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={set("name")} placeholder="e.g., Riya Kapoor" required />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set("email")} placeholder="riya@example.com" required />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={set("phone")} placeholder="+91 98xxxxxxx" />
          </div>
          <div className="field">
            <label className="label">Total Spend (₹)</label>
            <input className="input" type="number" min="0" value={form.total_spend} onChange={set("total_spend")} />
            <span className="help">Cumulative spend to date</span>
          </div>
          <div className="field">
            <label className="label">Visits</label>
            <input className="input" type="number" min="0" value={form.visits} onChange={set("visits")} />
          </div>
          <div className="actions" style={{ alignSelf: "end" }}>
            <button className="btn primary" disabled={saving}>{saving ? "Queuing..." : "Queue Customer"}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Recent Customers</h3>
          <button className="btn" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
        {loadErr && <p style={{ color: "#f87171" }}>Error: {loadErr}</p>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Spend</th><th>Visits</th></tr>
            </thead>
            <tbody>
              {recent.length ? recent.map((c) => (
                <tr key={c._id || `${c.email}-${c.name}`}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{INR.format(c.total_spend || 0)}</td>
                  <td>{c.visits ?? 0}</td>
                </tr>
              )) : !loading && <tr><td colSpan="4" className="muted">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Showing latest 10</div>
      </div>
    </div>
  );
}
