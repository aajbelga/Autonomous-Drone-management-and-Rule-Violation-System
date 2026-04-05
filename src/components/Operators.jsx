import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5001';

export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [operatorId, setOperatorId] = useState('');
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Function to refresh table
  const loadOperators = () => {
    setLoading(true);
    fetch(`${API}/operators`)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch operators'); return res.json(); })
      .then(data => { setOperators(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleAddOperator = (e) => {
    e.preventDefault();

    // ✅ DATA FORMAT MUST MATCH EXACTLY
    const dataToSend = {
      "OperatorID": operatorId,
      "Name": name,
      "ExperienceYears": experience
    };

    setSubmitting(true);

    // ✅ URL MUST BE EXACT: http://127.0.0.1:5001/add_operator
    fetch("http://127.0.0.1:5001/add_operator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataToSend)
    })
    .then(res => res.json())
    .then(data => {
      console.log(data); // 👈 SEE REAL DATA RESPONSE
      
      if (data.error) {
        alert("❌ " + data.error);
      } else {
        alert("✅ Operator Added");
        
        // Reset state
        setOperatorId("");
        setName("");
        setExperience("");
        
        loadOperators(); // 👈 REFRESH TABLE
      }
    })
    .catch(err => {
      console.log(err); // 👈 SEE REAL ERROR
      alert("❌ Failed to fetch");
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'rgba(5, 15, 30, 0.9)', 
    border: '1px solid var(--border-glow)', borderRadius: 8, color: 'var(--text-primary)',
    fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none'
  };

  return (
    <div className="page" id="operators-page">
      <div className="page-header">
        <h2>Operator Registry</h2>
        <p>Manage and view registered drone pilot credentials and experience.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ADD OPERATOR FORM */}
        <div className="glass-card">
          <div className="section-title">New Operator Registration</div>
          
          <form onSubmit={handleAddOperator} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Operator ID</label>
              <input 
                id="operatorId" 
                type="text" 
                value={operatorId}
                onChange={e => setOperatorId(e.target.value)}
                placeholder="e.g. OP107"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Name</label>
              <input 
                id="name" 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Prisha Agrawal"
                required
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Experience Years</label>
              <input 
                id="experience" 
                type="text" 
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="e.g. 1"
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" id="submit-operator-btn" className="btn-neon" disabled={submitting} style={{ marginTop: 8, width: '100%', padding: '14px' }}>
              {submitting ? '◌ Processing...' : '⚡ Add Operator'}
            </button>
          </form>
        </div>

        {/* OPERATORS TABLE */}
        <div className="glass-card">
          {error && (
            <div style={{ color: 'var(--danger)', padding: '16px', background: 'rgba(255,59,92,0.1)', borderRadius: '8px', marginBottom: '16px', fontSize: 13, border: '1px solid rgba(255,59,92,0.3)' }}>
              ⚠️ {error}
            </div>
          )}

          {loading && operators.length === 0 ? (
            <div className="loading-wrap" style={{ padding: '40px' }}>
              <div className="spinner"></div>
              <span>Accessing registry data…</span>
            </div>
          ) : (
            <>
              <div className="section-title">
                Active Pilots
                <span className="badge blue" style={{ marginLeft: 'auto' }}>{operators.length} Total</span>
              </div>
              <div className="table-container">
                <table className="data-table" id="operators-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>OperatorID</th>
                      <th>Name</th>
                      <th style={{ width: '180px' }}>ExperienceYears</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map((op, i) => (
                      <tr key={op.OperatorID || i}>
                        <td style={{ color: 'var(--cyan)', fontFamily: 'var(--font-brand)' }}>{op.OperatorID}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{op.Name}</td>
                        <td>{op.ExperienceYears || op.experience || '—'}</td>
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
