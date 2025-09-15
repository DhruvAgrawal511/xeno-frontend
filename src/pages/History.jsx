import { useEffect, useState } from 'react';
import API from '../api';

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      // 👇 call the correct method
      const res = await API.campaignHistory();
      setRows(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      setErr(e.message || 'Failed to load history');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <h3>Campaign History</h3>
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: '#f87171' }}>Error: {err}</p>}
      {!loading && !err && (
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
            {rows.length ? rows.map(r => (
              <tr key={r._id}>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                <td style={{ maxWidth: 420, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {r.message}
                </td>
                <td>{r.status}</td>
                <td>{r.stats?.audience ?? r.audienceSize ?? 0}</td>
                <td>{r.stats?.sent ?? 0}</td>
                <td>{r.stats?.failed ?? 0}</td>
              </tr>
            )) : (
              <tr><td colSpan="6"><small className="muted">Most recent at the top.</small></td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
