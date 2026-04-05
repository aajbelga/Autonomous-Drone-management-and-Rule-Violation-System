import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

const riskConfig = {
  HIGH:   { color: 'var(--danger)',  icon: '🔴', label: 'Critical Risk' },
  MEDIUM: { color: 'var(--warning)', icon: '🟡', label: 'Moderate Risk' },
  LOW:    { color: 'var(--success)', icon: '🟢', label: 'Low Risk' },
};

export default function OperatorRisk() {
  const [operatorsList, setOperatorsList] = useState([]); // Dynamic list
  const [operator, setOperator] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all operators for the selection dropdown
  useEffect(() => {
    fetch(`${API}/operators`)
      .then(res => res.json())
      .then(data => {
        setOperatorsList(data);
        if (data.length > 0) setOperator(data[0].OperatorID);
      })
      .catch(err => console.error("Failed to load operator list:", err));
  }, []);

  const getRisk = () => {
    setLoading(true);
    setError(null);
    setRiskData(null);
    fetch(`${API}/risk/${operator}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch risk data');
        return res.json();
      })
      .then(data => { setRiskData(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  const cfg = riskData ? (riskConfig[riskData.RiskLevel] || riskConfig.LOW) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Operator Risk Analysis</h2>
        <p>Evaluate operator risk profile based on violation history</p>
      </div>

      <div className="glass-card">
        <div className="section-title">Risk Query Terminal</div>
        <div className="control-bar">
          <select
            id="operator-select"
            className="neon-select"
            value={operator}
            onChange={e => setOperator(e.target.value)}
          >
            {operatorsList.map(op => (
              <option key={op.OperatorID} value={op.OperatorID}>
                {op.OperatorID} {op.Name ? `(${op.Name})` : ''}
              </option>
            ))}
          </select>
          <button id="analyze-risk-btn" className="btn-neon" onClick={getRisk} disabled={loading}>
            {loading ? '◌ Analyzing…' : '⚡ Analyze Risk'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Select an operator ID and click Analyze Risk to fetch the risk profile from the backend.
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(255,59,92,0.4)', color: 'var(--danger)', marginTop: 20, padding: '16px 24px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="loading-wrap">
          <div className="spinner"></div>
          <span>Computing risk score…</span>
        </div>
      )}

      {riskData && cfg && (
        <div className="risk-result-card">
          <div className="section-title">Risk Assessment Result</div>

          <div className="risk-header">
            <span className={`risk-level-badge ${riskData.RiskLevel}`}>
              {cfg.icon} {riskData.RiskLevel} RISK
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{cfg.label}</span>
          </div>

          <div className="risk-metrics">
            <div className="risk-metric">
              <div className="metric-label">Operator ID</div>
              <div className="metric-value" style={{ fontSize: 18, color: 'var(--cyan)' }}>
                {riskData.OperatorID}
              </div>
            </div>

            <div className="risk-metric">
              <div className="metric-label">Total Violations</div>
              <div className="metric-value" style={{ color: riskData.Violations > 3 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {riskData.Violations}
              </div>
            </div>

            <div className="risk-metric" style={{ gridColumn: '1 / -1' }}>
              <div className="metric-label">Risk Classification</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <div style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: 'rgba(0,200,255,0.1)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: riskData.RiskLevel === 'HIGH' ? '90%' : riskData.RiskLevel === 'MEDIUM' ? '55%' : '20%',
                    background: cfg.color,
                    borderRadius: 3,
                    boxShadow: `0 0 10px ${cfg.color}`,
                    transition: 'width 0.6s ease'
                  }}></div>
                </div>
                <span style={{ color: cfg.color, fontFamily: 'var(--font-brand)', fontSize: 12, minWidth: 70 }}>
                  {riskData.RiskLevel}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(0,200,255,0.04)', borderRadius: 8, border: '1px solid rgba(0,200,255,0.1)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              ℹ️ Risk levels: LOW (0–2 violations) · MEDIUM (3–5) · HIGH (6+)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
