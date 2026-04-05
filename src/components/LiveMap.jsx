import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API = 'http://127.0.0.1:5001';

const droneHtml = `<div style="font-size: 24px; filter: drop-shadow(0 0 8px #00c8ff); animation: spin 4s linear infinite;">🚁</div>`;
const droneIcon = new L.DivIcon({ 
  html: droneHtml, 
  className: 'live-drone-icon', 
  iconSize: [24,24], 
  iconAnchor: [12,12] 
});

export default function LiveMap() {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default Center (e.g., tech hub / HQ)
  const center = [28.6139, 77.2090];
  const noFlyZone = [28.6150, 77.2100]; // Overlay NFZ slightly off-center

  useEffect(() => {
    // Fetch drones and flights simultaneously to pair their data
    Promise.all([
      fetch(`${API}/drones`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API}/flights`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([dData, fData]) => {
      
      const merged = dData.map((d, i) => {
        // Find flight data for altitude (or just use index if no clear mapping)
        const flight = fData.find(f => String(f.DroneID || '') === String(d.DroneID)) || fData[i] || {};
        
        // Generate mock GPS around No-Fly Zone for stunning visual effect 
        // (unless your db provides actual d.Lat/d.Lng)
        const lat = d.Lat || (center[0] + (Math.random() - 0.5) * 0.04);
        const lng = d.Lng || (center[1] + (Math.random() - 0.5) * 0.04);

        return {
          id: d.DroneID,
          name: d.Model || 'Unknown Model',
          type: d.Type || 'Uncategorized',
          status: d.Status || 'Active',
          altitude: flight.Altitude || (Math.floor(Math.random() * 120) + 30), // Random 30-150m
          operator: d.OperatorID,
          lat, lng
        };
      });
      setMapData(merged);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0, marginBottom: 16 }}>
        <h2>Live Airspace Radar</h2>
        <p>Real-time telemetry, altitude mapping, and No-Fly Zone (NFZ) geographic tracking.</p>
      </div>

      <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative', borderRadius: 14 }}>
        {loading && (
          <div className="loading-wrap" style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(5, 10, 18, 0.8)' }}>
            <div className="spinner"></div>
            <span>Calibrating radar signals & satellite feed…</span>
          </div>
        )}
        
        <MapContainer center={center} zoom={13} zoomControl={false} style={{ width: '100%', height: '100%', background: '#050a12', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />

          {/* Red No-Fly Zone */}
          <Circle 
            center={noFlyZone} 
            radius={1200} 
            pathOptions={{ color: '#ff3b5c', fillColor: '#ff3b5c', fillOpacity: 0.15, weight: 2, dashArray: '5, 5' }}
          >
            <Popup>
              <div style={{ color: '#000', fontFamily: 'var(--font-ui)' }}>
                <strong style={{ color: '#ff3b5c' }}>RESTRICTED: NO-FLY ZONE</strong>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#444' }}>Unauthorized entry triggers automatic Tier-1 violations.</p>
              </div>
            </Popup>
          </Circle>

          {/* Live Drone Markers */}
          {mapData.map(d => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={droneIcon}>
              <Popup className="drone-popup">
                <div style={{ color: '#111', fontFamily: 'var(--font-ui)', minWidth: 150 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{d.id}</span>
                    <span style={{ fontSize: 10, background: '#eee', padding: '2px 6px', borderRadius: 4 }}>{d.status}</span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                    <div><b>Model:</b> {d.name}</div>
                    <div><b>Pilot:</b> {d.operator}</div>
                    <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dotted #ccc' }}>
                      <b>Altitude:</b> <span style={{ color: d.altitude > 100 ? '#ff3b5c' : '#0066ff', fontWeight: 'bold' }}>{d.altitude}m</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating HUD Widget */}
        <div style={{ 
          position: 'absolute', top: 20, right: 20, zIndex: 500, 
          background: 'rgba(5, 12, 25, 0.85)', padding: '12px 16px', 
          borderRadius: 8, border: '1px solid rgba(0, 200, 255, 0.3)', 
          backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' }}>
            Active Transponders
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28, fontFamily: 'var(--font-brand)', color: 'var(--cyan-bright)', lineHeight: 1 }}>{mapData.length}</span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', animation: 'pulse 1.5s infinite' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
