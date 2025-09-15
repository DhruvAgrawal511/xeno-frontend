import { useEffect, useState } from "react";
import API from "../api";

export default function Campaigns() {
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [segmentId, setSegmentId] = useState("");
  const [message, setMessage] = useState("here’s 10% off on your next order!");
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  async function load() {
    setLoadErr("");
    try {
      const s = await API.listSegments();
      const segs = Array.isArray(s) ? s : s?.data || s?.segments || [];
      setSegments(segs);

      const c = await API.listCampaigns();
      const cams = Array.isArray(c) ? c : c?.data || [];
      setCampaigns(cams);
    } catch (e) {
      console.error("Campaigns load failed:", e);
      setLoadErr(e?.message || "Failed to load data");
    }
  }

  useEffect(() => { load(); }, []);

  const createAndSend = async () => {
    if (!segmentId) {
      setActionMsg("Please select a segment");
      return;
    }
    setSaving(true);
    setActionMsg("");
    try {
      const res = await API.createCampaign(segmentId, message);
      const id = res?._id || res?.id;
      if (id) {
        await API.sendCampaign(id);
        setActionMsg("Campaign created and send initiated");
      } else {
        setActionMsg("Created campaign, but no id returned");
      }
      await load();
    } catch (e) {
      console.error("Create/Send failed:", e);
      setActionMsg("Failed: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const recent = campaigns.slice(0, 10);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Create Campaign</h3>

        <div className="form grid-2">
          <div className="field">
            <label className="label">Segment</label>
            <select className="select" value={segmentId} onChange={e=>setSegmentId(e.target.value)}>
              <option value="">Select…</option>
              {segments.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <span className="help">Audience is computed when sending</span>
          </div>

          <div className="field">
            <label className="label">Message</label>
            <input className="input" value={message} onChange={e=>setMessage(e.target.value)} />
          </div>

          <div className="actions" style={{ alignSelf: "end" }}>
            <button className="btn primary" onClick={createAndSend} disabled={saving || !segmentId}>
              {saving ? "Sending…" : "Create & Send"}
            </button>
          </div>
        </div>

        {actionMsg && <p className="muted" style={{ marginTop: 8 }}>{actionMsg}</p>}
      </div>

      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3>Recent Campaigns</h3>
          <button className="btn" onClick={load}>Refresh</button>
        </div>
        {loadErr && <p style={{ color: "#f87171" }}>Error: {loadErr}</p>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Message</th>
                <th>Status</th>
                <th>Audience</th>
                <th>Sent</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? recent.map(c => (
                <tr key={c._id}>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                  <td style={{ maxWidth: 420, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {c.message}
                  </td>
                  <td>{c.status}</td>
                  <td>{c.stats?.audience ?? c.audienceSize ?? 0}</td>
                  <td>{c.stats?.sent ?? 0}</td>
                  <td>{c.stats?.failed ?? 0}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="muted">No campaigns yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Showing latest 10</div>
      </div>
    </div>
  );
}
