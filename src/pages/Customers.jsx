// src/pages/Customers.jsx
import { useEffect, useState, useRef } from "react";
import API from "../api";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const reconcilerTimers = useRef({}); // keep track of polling timers per queued id (so we can cancel if unmounted)

  async function load() {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await API.listCustomers(1, 200);
      const list = parseList(res);
      // ensure stable array
      setRows(Array.isArray(list) ? list : []);
      console.log("[Customers] loaded", { length: (list || []).length });
    } catch (e) {
      console.error(e);
      setLoadErr(e.message || "Failed to load customers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => {
      // cleanup any timers if component unmounts
      Object.values(reconcilerTimers.current).forEach((t) => clearInterval(t));
      reconcilerTimers.current = {};
    };
  }, []);

  // poll for ID to appear in persisted DB (consumer may take a moment)
  async function pollForPersistence(id, attempts = 6, intervalMs = 2000) {
    if (!id) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const res = await API.listCustomers(1, 200); // list endpoint returns latest items
        const list = parseList(res);
        const found = (list || []).find((c) => c._id === id || String(c._id) === String(id));
        if (found) {
          // replace optimistic item with real item
          setRows((prev) => {
            const filtered = prev.filter((r) => !(r._id === id && r._queued));
            // put found at top
            return [found, ...filtered];
          });
          clearInterval(timer);
          delete reconcilerTimers.current[id];
          return;
        }
      } catch (err) {
        // ignore network errors during poll, but log for debugging
        console.debug("[Customers] poll error", err?.message || err);
      }
      if (tries >= attempts) {
        // give up after attempts
        clearInterval(timer);
        delete reconcilerTimers.current[id];
      }
    }, intervalMs);

    reconcilerTimers.current[id] = timer;
  }

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // sanitize / convert numeric fields
      const payload = {
        name: (form.name || "").trim(),
        email: (form.email || "").trim(),
        phone: (form.phone || "").trim(),
        total_spend: Number(form.total_spend || 0),
        visits: Number(form.visits || 0),
      };

      if (!payload.name || !payload.email) {
        alert("Please provide name and email.");
        setSaving(false);
        return;
      }

      // call API; expect response like { ok: true, id: "..." }
      const res = await API.createCustomer(payload);

      // If backend returned id, optimistic add with queued flag so UI shows immediately
      const id = res?.id || (`temp-${Date.now()}`); // fallback id if backend didn't provide one
      const newRow = {
        _id: id,
        ...payload,
        _queued: !res?.id, // if server didn't give id, it's 'optimistic without server id'
        createdAt: new Date().toISOString(),
      };

      setRows((prev) => [newRow, ...prev]);
      setForm({ name: "", email: "", phone: "", total_spend: 0, visits: 0 });

      // if server provided a real id (or even if it didn't) start a poll to reconcile with persisted DB
      // poll attempts: 6 times, 2s apart (adjust as needed)
      pollForPersistence(id, 8, 2000);
    } catch (e2) {
      console.error(e2);
      // e2 might be Error object thrown by req(), so show message
      const msg = e2?.message || JSON.stringify(e2);
      alert("Failed to queue customer: " + msg);
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
            <input
              className="input"
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g., Riya Kapoor"
              required
            />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={setField("email")}
              placeholder="riya@example.com"
              required
            />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={setField("phone")} placeholder="+91 98xxxxxxx" />
          </div>

          <div className="field">
            <label className="label">Total Spend (₹)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.total_spend}
              onChange={(e) => setForm((f) => ({ ...f, total_spend: Number(e.target.value || 0) }))}
            />
            <span className="help">Cumulative spend to date</span>
          </div>

          <div className="field">
            <label className="label">Visits</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.visits}
              onChange={(e) => setForm((f) => ({ ...f, visits: Number(e.target.value || 0) }))}
            />
          </div>

          <div className="actions" style={{ alignSelf: "end" }}>
            <button className="btn primary" disabled={saving}>
              {saving ? "Queuing..." : "Queue Customer"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Recent Customers</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {loadErr && <p style={{ color: "#f87171" }}>Error: {loadErr}</p>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Spend</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((c) => {
                  const isQueued = !!c._queued;
                  return (
                    <tr key={c._id || `${c.email}-${c.name}-${Math.random()}`}>
                      <td>
                        {c.name}
                        {isQueued ? (
                          <span style={{ marginLeft: 8, padding: "2px 8px", background: "#2b2b2b", borderRadius: 12, fontSize: 12 }}>
                            Queued
                          </span>
                        ) : null}
                      </td>
                      <td>{c.email}</td>
                      <td>{INR.format(c.total_spend || 0)}</td>
                      <td>{c.visits ?? 0}</td>
                    </tr>
                  );
                })
              ) : !loading ? (
                <tr>
                  <td colSpan="4" className="muted">
                    No customers yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          Showing latest 10
        </div>
      </div>
    </div>
  );
}
