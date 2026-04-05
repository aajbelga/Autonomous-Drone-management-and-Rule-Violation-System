import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

const statusColor = {
  Active:    'green',
  Inactive:  'gray',
  Flagged:   'red',
  Grounded:  'red',
  Available: 'cyan',
  default:   'blue',
};

export default function Drones() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [droneId, setDroneId] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Commercial');
  const [status, setStatus] = useState('Active');
  const [operatorId, setOperatorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchDrones = () => {
    setLoading(true);
    fetch(`${API}/drones`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch drones'); return res.json(); })
      .then(data => { setDrones(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const handleAddDrone = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError(null);

    const droneData = {
      "DroneID": droneId,
      "Model": model,
      "Type": type,
      "Status": status,
      "OperatorID": operatorId
    };

    try {
      const res = await fetch(`${API}/add_drone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(droneData)
      });

      const data = await res.json().catch(() => ({ message: "Server returned non-JSON response" }));

      if (!res.ok) {
        throw new Error(data.message || data.error || `Server Error (${res.status})`);
      }

      // Success Logic
      alert("✅ Drone Added Successfully");
      
      // Reset Form
      setDroneId('');
      setModel('');
      setType('Commercial');
      setStatus('Active');
      setOperatorId('');

      // Refresh data
      fetchDrones();

    } catch (err) {
      console.log(err);
      alert("❌ Registration Failed: " + err.message);
      setError(`REGISTRATION FAILED: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statusValue) => {
    const cls = statusColor[statusValue] || statusColor.default;
    return <span className={`badge ${cls}`}>{statusValue}</span>;
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', background: 'rgba(5, 15, 30, 0.9)', 
    border: '1px solid var(--border-glow)', borderRadius: 8, color: 'var(--text-primary)',
    fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none'
  };

  return (
    <div className="page" id="drones-page">
      <div className="page-header">
        <h2>Drone Fleet Registry</h2>
        <p>Complete inventory and registration of autonomous aerial vehicles.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ADD DRONE FORM */}
        <div className="glass-card">
          <div className="section-title">Register New Drone</div>
          
          {success && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(0,230,118,0.1)', border: '1px solid var(--success)', borderRadius: 8, color: 'var(--success)', fontSize: 12, fontWeight: 500 }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleAddDrone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Drone ID</label>
                <input id="droneId" type="text" value={droneId} onChange={e => setDroneId(e.target.value)} placeholder="DR-400" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Model</label>
                <input id="model" type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="Eagle-X" required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Type</label>
                <select id="type" value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                  <option value="Commercial">Commercial</option>
                  <option value="Government">Government</option>
                  <option value="Recreational">Recreational</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Status</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Operator ID</label>
              <input id="operatorId" type="text" value={operatorId} onChange={e => setOperatorId(e.target.value)} placeholder="OP101" required style={inputStyle} />
            </div>

            <button type="submit" className="btn-neon" disabled={submitting} style={{ marginTop: 10, width: '100%', padding: '14px' }}>
              {submitting ? '◌ Transmitting...' : '⚡ Register Drone'}
            </button>
          </form>
        </div>

        {/* DRONE TABLE */}
        <div className="glass-card">
          {error && <div style={{ color: 'var(--danger)', padding: '16px', marginBottom: 16 }}>⚠️ {error}</div>}

          {loading && drones.length === 0 ? (
            <div className="loading-wrap">
              <div className="spinner"></div>
              <span>Decrypting drone transponder log…</span>
            </div>
          ) : (
            <>
              <div className="section-title">
                Fleet Inventory
                <span className="badge blue" style={{ marginLeft: 'auto' }}>{drones.length} Units</span>
              </div>
              <div className="table-container">
                <table className="data-table" id="drones-table">
                  <thead>
                    <tr>
                      <th>Drone ID</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Operator ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drones.map((drone, i) => (
                      <tr key={drone.DroneID || i}>
                        <td style={{ color: 'var(--cyan-bright)', fontFamily: 'var(--font-brand)', fontSize: '11px' }}>{drone.DroneID}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{drone.Model}</td>
                        <td>{drone.Type}</td>
                        <td>{getStatusBadge(drone.Status)}</td>
                        <td style={{ color: 'var(--cyan-dim)' }}>{drone.OperatorID}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
