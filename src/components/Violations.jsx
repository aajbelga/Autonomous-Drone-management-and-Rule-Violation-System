import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

const severityColor = {
  HIGH:     'red',
  CRITICAL: 'red',
  MEDIUM:   'yellow',
  LOW:      'green',
  default:  'gray',
};

const severityIcon = {
  HIGH:     '🔴',
  CRITICAL: '🚨',
  MEDIUM:   '🟡',
  LOW:      '🟢',
  default:  '⚪',
};

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    fetch(`${API}/violations`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
      .then(data => { setViolations(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const getSeverityBadge = (sev) => {
    const cls  = severityColor[sev?.toUpperCase()] || severityColor.default;
    const icon = severityIcon[sev?.toUpperCase()]  || severityIcon.default;
    return <span className={`badge ${cls}`}>{icon} {sev}</span>;
  };

  const countBySeverity = (sev) =>
    violations.filter(v => v.Severity?.toUpperCase() === sev).length;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Airspace Violation Log</h2>
        <p>Recorded airspace infractions, severity ratings &amp; penalties</p>
      </div>

      {/* summary chips */}
      {!loading && !error && violations.length > 0 && (
        <div className="control-bar" style={{ marginBottom: 20 }}>
          <span className="badge red">🔴 HIGH: {countBySeverity('HIGH')}</span>
          <span className="badge yellow">🟡 MEDIUM: {countBySeverity('MEDIUM')}</span>
          <span className="badge green">🟢 LOW: {countBySeverity('LOW')}</span>
          <span className="badge gray" style={{ marginLeft: 'auto' }}>Total: {violations.length}</span>
        </div>
      )}

      <div className="glass-card">
        {loading && (
          <div className="loading-wrap">
            <div className="spinner"></div>
            <span>Loading violation records…</span>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', padding: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="section-title">
              Violation Records
            </div>
            <div className="table-container">
              <table className="data-table" id="violations-table">
                <thead>
                  <tr>
                    <th>Violation ID</th>
                    <th>Severity</th>
                    <th>Penalty (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v, i) => (
                    <tr key={v.ViolationID || i}>
                      <td>{v.ViolationID}</td>
                      <td>{getSeverityBadge(v.Severity)}</td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-brand)',
                          color: severityColor[v.Severity?.toUpperCase()] === 'red'
                            ? 'var(--danger)'
                            : severityColor[v.Severity?.toUpperCase()] === 'yellow'
                            ? 'var(--warning)'
                            : 'var(--success)',
                          fontSize: 13
                        }}>
                          ₹{Number(v.Penalty).toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {violations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No violations recorded.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
