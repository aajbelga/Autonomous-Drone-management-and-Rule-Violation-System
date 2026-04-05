import { useState, useEffect } from 'react';
import Sidebar      from './components/Sidebar';
import Dashboard    from './components/Dashboard';
import LiveMap      from './components/LiveMap';
import Operators    from './components/Operators';
import OperatorRisk from './components/OperatorRisk';
import Drones       from './components/Drones';
import Flights      from './components/Flights';
import Violations   from './components/Violations';

const PAGE_META = {
  dashboard:  { title: 'System Overview',           sub: 'Operational intelligence dashboard' },
  map:        { title: 'Live Airspace Radar',       sub: 'FlightRadar24-style active telemetry' },
  operators:  { title: 'Operator Directory',        sub: 'Complete roster of registered drone pilots' },
  risk:       { title: 'Operator Risk Analysis',    sub: 'Dynamic risk profiling engine' },
  drones:     { title: 'Drone Fleet Registry',      sub: 'UAV inventory & status tracking' },
  flights:    { title: 'Flight Operations',         sub: 'Airspace activity & routing data' },
  violations: { title: 'Violation Management',      sub: 'Incident log & penalty records' },
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="topbar-time">
      {time.toLocaleTimeString('en-US', { hour12: false })} IST
    </span>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const meta = PAGE_META[page] || PAGE_META.dashboard;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard />;
      case 'map':        return <LiveMap />;
      case 'operators':  return <Operators />;
      case 'risk':       return <OperatorRisk />;
      case 'drones':     return <Drones />;
      case 'flights':    return <Flights />;
      case 'violations': return <Violations />;
      default:           return <Dashboard />;
    }
  };

  return (
    <>
      <div className="bg-grid" />
      <div className="app-layout">
        <Sidebar active={page} onNav={setPage} />

        <div className="main-content">
          {/* Top Bar */}
          <header className="topbar">
            <div className="topbar-title">
              <h2>{meta.title}</h2>
              <p>{meta.sub}</p>
            </div>
            <div className="topbar-right">
              <LiveClock />
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,200,255,0.1)',
                border: '1px solid rgba(0,200,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, cursor: 'pointer'
              }} title="Admin">👤</div>
            </div>
          </header>

          {/* Page Content */}
          {renderPage()}
        </div>
      </div>
    </>
  );
}
