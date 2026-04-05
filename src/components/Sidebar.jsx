import { useState } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'map',       label: 'Live Map', icon: '🌍' },
  { id: 'operators', label: 'Operators', icon: '👥' },
  { id: 'risk',      label: 'Operator Risk', icon: '🚨' },
  { id: 'drones',    label: 'Drones', icon: '🚁' },
  { id: 'flights',   label: 'Flights', icon: '📡' },
  { id: 'violations',label: 'Violations', icon: '⚠️' },
];

export default function Sidebar({ active, onNav }) {
  const [time] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛸</div>
        <h1>DroneATC</h1>
        <div className="logo-sub">Airspace Control</div>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        ADTAVMS v2.0 © 2025
      </div>
    </aside>
  );
}
