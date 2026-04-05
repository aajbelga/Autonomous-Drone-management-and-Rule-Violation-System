import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

const flightStatusColor = {
  Completed:  'green',
  Active:     'cyan',
  Scheduled:  'blue',
  Cancelled:  'red',
  InProgress: 'yellow',
  Violated:   'red',
  default:    'gray',
};

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [droneId, setDroneId] = useState('');
  const [altitude, setAltitude] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [status, setStatus] = useState('Active');
  const [controllerId, setControllerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [violationAlert, setViolationAlert] = useState(null);

  const fetchFlights = () => {
    setLoading(true);
    fetch(`${API}/flights`)
      .then(res => { 
        if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to synchronize record log.`); 
        return res.json(); 
      })
      .then(data => { setFlights(data); setLoading(false); })
      .catch(err => { 
        setError(`DATABASE SYNC LOST: ${err.message}`); 
        setLoading(false); 
      });
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setViolationAlert(null);
    setError(null);

    // EXACT JSON FORMAT REQUESTED BY USER
    const flightData = {
      "DroneID": droneId,
      "Altitude": altitude,
      "ZoneID": zoneId,
      "Status": status,
      "ControllerID": controllerId
    };

    try {
      console.log("TRANSMITTING FLIGHT DATA:", JSON.stringify(flightData));

      const res = await fetch(`${API}/add_flight`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(flightData)
      });

      const data = await res.json().catch(() => ({ message: "Server returned non-JSON response" }));

      if (!res.ok) {
        // Show proper error message from backend
        throw new Error(data.message || data.error || `Server Error (${res.status})`);
      }

      if (data.violation === true || data.violation === "true") {
        setViolationAlert(data.reason || "Unauthorized flight parameters detected.");
      }

      // Success: Refresh list and clear form
      alert("✅ Flight Registered Successfully");
      fetchFlights();
      setDroneId('');
      setAltitude('');
      setZoneId('');
      setControllerId('');

    } catch (err) {
      console.log(err);
      alert("❌ Registration Failed: " + err.message);
      setError(`REGISTRATION FAILED: ${err.message}`);
      console.error("Flight Registration Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statusValue) => {
    const cls = flightStatusColor[statusValue] || flightStatusColor.default;
    return <span className={`badge ${cls}`}>{statusValue}</span>;
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', background: 'rgba(5, 15, 30, 0.9)', 
    border: '1px solid var(--border-glow)', borderRadius: 8, color: 'var(--text-primary)',
    fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none'
  };

  return (
    <div className="page" id="flights-page">
      <div className="page-header">
        <h2>Flight Operations Log</h2>
        <p>Monitor real-time flight telemetry and register new airspace activity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 4fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ADD FLIGHT FORM */}
        <div className="glass-card">
          <div className="section-title">Initiate Flight Sequence</div>
          
          {violationAlert && (
            <div style={{ 
              marginBottom: 16, padding: '12px 16px', background: 'rgba(255,59,92,0.15)', 
              border: '1px solid var(--danger)', borderRadius: 8, color: '#ff8095', 
              fontSize: 13, fontWeight: 600, boxShadow: '0 0 15px rgba(255,59,92,0.2)' 
            }}>
              ⚠️ Violation detected: {violationAlert}
            </div>
          )}

          <form onSubmit={handleAddFlight} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Drone ID</label>
                <input id="droneId" type="text" value={droneId} onChange={e => setDroneId(e.target.value)} placeholder="DR101" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Altitude (m)</label>
                <input id="altitude" type="text" value={altitude} onChange={e => setAltitude(e.target.value)} placeholder="120" required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Zone ID</label>
                <input id="zoneId" type="text" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="ZN01" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Status</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="InProgress">InProgress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Controller ID</label>
              <input 
                id="controllerId" 
                type="text" 
                value={controllerId} 
                onChange={e => setControllerId(e.target.value)} 
                placeholder="ATC01" 
                required 
                style={inputStyle} 
              />
            </div>

            <button type="submit" className="btn-neon" disabled={submitting} style={{ marginTop: 10, width: '100%', padding: '14px' }}>
              {submitting ? '◌ Transmitting...' : '🚀 Register Flight'}
            </button>
          </form>
        </div>

        {/* FLIGHTS TABLE */}
        <div className="glass-card">
          {error && (
            <div style={{ color: 'var(--danger)', padding: '16px', background: 'rgba(255,59,92,0.1)', borderRadius: '8px', marginBottom: '16px', fontSize: 13, border: '1px solid rgba(255,59,92,0.3)' }}>
              ⚠️ {error}
            </div>
          )}

          {loading && flights.length === 0 ? (
            <div className="loading-wrap">
              <div className="spinner"></div>
              <span>Synchronizing transponder data…</span>
            </div>
          ) : (
            <>
              <div className="section-title">
                Airspace Activity Log
                <span className="badge cyan" style={{ marginLeft: 'auto' }}>{flights.length} entries</span>
              </div>
              <div className="table-container">
                <table className="data-table" id="flights-table">
                  <thead>
                    <tr>
                      <th>Flight ID</th>
                      <th>Drone ID</th>
                      <th>Altitude</th>
                      <th>Zone ID</th>
                      <th>Controller</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight, i) => (
                      <tr key={flight.FlightID || i}>
                        <td style={{ color: 'var(--cyan-bright)', fontFamily: 'var(--font-brand)', fontSize: '11px' }}>{flight.FlightID}</td>
                        <td style={{ color: 'var(--text-primary)' }}>{flight.DroneID || '—'}</td>
                        <td>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{flight.Altitude}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>m</span>
                        </td>
                        <td>{flight.ZoneID}</td>
                        <td style={{ color: 'var(--cyan-dim)' }}>{flight.ControllerID || '—'}</td>
                        <td>{getStatusBadge(flight.Status)}</td>
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
