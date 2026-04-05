import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Airspace Control — Overview</h2>
        <p>Real-time operational intelligence &amp; system status</p>
      </div>

      {loading && (
        <div className="loading-wrap">
          <div className="spinner"></div>
          <span>Fetching operational data…</span>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ borderColor: 'rgba(255,59,92,0.4)', color: 'var(--danger)', padding: '20px 24px' }}>
          ⚠️ Backend unreachable: {error} — make sure Flask is running on port 5001.
        </div>
      )}

      {stats && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrap blue">👤</div>
              <div className="kpi-info">
                <div className="kpi-label">Total Operators</div>
                <div className="kpi-value">{stats.operators}</div>
                <div className="kpi-sub">Registered &amp; active</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap cyan">🚁</div>
              <div className="kpi-info">
                <div className="kpi-label">Total Drones</div>
                <div className="kpi-value">{stats.drones}</div>
                <div className="kpi-sub">Fleet inventory</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap red">⚠️</div>
              <div className="kpi-info">
                <div className="kpi-label">Total Violations</div>
                <div className="kpi-value">{stats.violations}</div>
                <div className="kpi-sub">Logged incidents</div>
              </div>
            </div>
          </div>

          <div className="grid-2col">
            <div className="glass-card">
              <div className="section-title">System Status</div>
              <div className="info-row">
                <span className="info-label">Backend API</span>
                <span className="badge green">● Online</span>
              </div>
              <div className="info-row">
                <span className="info-label">Database</span>
                <span className="badge green">● Connected</span>
              </div>
              <div className="info-row">
                <span className="info-label">Data Feed</span>
                <span className="badge cyan">● Live</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Sync</span>
                <span className="info-value" style={{ fontSize: 12 }}>
                  {time.toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="glass-card">
              <div className="section-title">Airspace Zone Map</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0' }}>
                <div className="radar-widget">
                  <div className="radar-ring" style={{ width: '100%', height: '100%' }}></div>
                  <div className="radar-ring" style={{ width: '66%', height: '66%' }}></div>
                  <div className="radar-ring" style={{ width: '33%', height: '33%' }}></div>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'spin 3s linear infinite' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: '50%',
                      transformOrigin: 'bottom center',
                      width: '2px', height: '50%',
                      background: 'linear-gradient(to top, transparent, var(--cyan))',
                      marginLeft: '-1px'
                    }}></div>
                  </div>
                  <span className="radar-icon">🛸</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>
                SCANNING ACTIVE SECTORS
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
