import { useEffect, useState } from "react";
import API from "../api";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function parseList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.orders)) return res.orders;
  return [];
}

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const [form, setForm] = useState({ email: "", amount: 0 });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true);
    setLoadErr("");
    try {
      // Optional: only load if you have an endpoint; otherwise keep empty list
      const res = API.listOrders ? await API.listOrders(1, 200) : [];
      const list = parseList(res);
      setRows(list);
      console.log("[Orders] loaded", { length: list.length });
    } catch (e) {
      console.warn("Orders list fetch failed (optional):", e?.message || e);
      setLoadErr(""); // keep quiet—listing is optional
      setRows([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNote("");
    try {
      const payload = {
        email: form.email.trim(),
        amount: Number(form.amount) || 0,
      };
      await API.createOrderByEmail(payload);
      setForm({ email: "", amount: 0 });
      setNote("Order queued successfully");
      await load();
    } catch (e2) {
      console.error("Create order failed:", e2);
      // Show inline error instead of alert popup
      setNote("Failed to queue order: " + (e2?.message || e2));
    } finally {
      setSaving(false);
    }
  };

  const recent = rows.slice(0, 10);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Add Order</h3>
        <form className="form grid-3" onSubmit={submit}>
          <div className="field">
            <label className="label">Customer Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="customer@example.com"
              required
            />
            <span className="help">We’ll associate the order using email</span>
          </div>
          <div className="field">
            <label className="label">Amount (₹)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.amount}
              onChange={set("amount")}
              required
            />
          </div>
          <div className="actions" style={{ alignSelf: "end" }}>
            <button className="btn primary" disabled={saving}>
              {saving ? "Queuing..." : "Queue Order"}
            </button>
          </div>
        </form>
        {note && <p className="muted" style={{ marginTop: 8 }}>{note}</p>}
      </div>

      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3>Recent Orders</h3>
          <button className="btn" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
        {loadErr && <p style={{ color:"#f87171" }}>Error: {loadErr}</p>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Email</th><th>Amount</th><th>Created</th></tr>
            </thead>
            <tbody>
              {recent.length ? recent.map((o) => (
                <tr key={o._id || `${o.email}-${o.createdAt || Math.random()}`}>
                  <td>{o.email || o.customer?.email}</td>
                  <td>{INR.format(o.amount || 0)}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                </tr>
              )) : !loading && <tr><td colSpan="3" className="muted">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Showing latest 10</div>
      </div>
    </div>
  );
}
