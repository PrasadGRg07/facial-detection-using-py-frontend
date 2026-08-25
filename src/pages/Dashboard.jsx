import { useState, useEffect, useRef } from 'react';

const VIDEO_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/video_feed`
  : '/video_feed';

export default function Dashboard({ knownCount, detectionLog, serverOnline }) {
  const [frameCount, setFrameCount] = useState(0);
  const imgRef = useRef(null);

  // Count frames via error/load events on the MJPEG img
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const handler = () => setFrameCount((c) => c + 1);
    img.addEventListener('load', handler);
    return () => img.removeEventListener('load', handler);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Live Recognition Feed</h2>
        <p>Real-time facial recognition from your webcam</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{knownCount}</div>
          <div className="stat-label">Registered Faces</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{detectionLog.length}</div>
          <div className="stat-label">Detections (session)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: serverOnline ? 'var(--accent)' : 'var(--accent-red)', fontSize: 18 }}>
            {serverOnline ? '● LIVE' : '● OFFLINE'}
          </div>
          <div className="stat-label">Server Status</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Video Feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="video-container">
            {serverOnline ? (
              <>
                <img
                  ref={imgRef}
                  id="video-feed"
                  className="video-feed"
                  src={VIDEO_URL}
                  alt="Live facial recognition stream"
                />
                <div className="video-overlay">
                  <div className="video-badge">
                    <span className="dot" style={{ width: 6, height: 6 }} />
                    LIVE
                  </div>
                  <div className="video-badge" style={{ color: 'var(--text-secondary)' }}>
                    640×480
                  </div>
                </div>
              </>
            ) : (
              <div className="video-placeholder">
                <div className="icon">📷</div>
                <p>Backend server is offline</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Run <code style={{ color: 'var(--accent)' }}>python app.py</code> to start
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detection Log */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Detection Log</span>
            <span className="text-muted text-sm">{detectionLog.length} events</span>
          </div>

          {detectionLog.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="icon" style={{ fontSize: 32 }}>👁️</div>
              <p style={{ marginTop: 8 }}>No detections yet</p>
            </div>
          ) : (
            <div className="log-list">
              {detectionLog.map((entry, i) => (
                <div
                  key={i}
                  className={`log-item ${entry.name === 'Unknown' ? 'unknown' : ''}`}
                >
                  <span style={{ fontSize: 14 }}>
                    {entry.name === 'Unknown' ? '❓' : '✅'}
                  </span>
                  <span className="log-name">{entry.name}</span>
                  <span className="log-time">{entry.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
