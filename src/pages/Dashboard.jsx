import { useState, useEffect, useRef } from 'react';
import { detectFaces } from '../api';

export default function Dashboard({ knownCount, detectionLog, serverOnline }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const serverOnlineRef = useRef(serverOnline);

  // Keep ref in sync
  useEffect(() => {
    serverOnlineRef.current = serverOnline;
  }, [serverOnline]);

  // Start Webcam
  useEffect(() => {
    let stream = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const drawBoxes = (detectedFaces, width, height) => {
    const overlay = canvasRef.current;
    if (!overlay) return;
    overlay.width = width;
    overlay.height = height;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    detectedFaces.forEach(face => {
      const [top, right, bottom, left] = face.box;
      const name = face.name;
      
      ctx.strokeStyle = name !== 'Unknown' ? '#00FF80' : '#FF5000';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, right - left, bottom - top);

      ctx.fillStyle = name !== 'Unknown' ? '#00FF80' : '#FF5000';
      ctx.fillRect(left, bottom - 28, right - left, 28);
      
      ctx.fillStyle = '#000000';
      ctx.font = '16px sans-serif';
      ctx.fillText(name, left + 6, bottom - 8);
    });
  };

  // Processing loop
  useEffect(() => {
    const processFrame = async () => {
      if (!serverOnlineRef.current) return;
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      if (video.videoWidth === 0) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const result = await detectFaces(base64Image);
        drawBoxes(result.faces || [], video.videoWidth, video.videoHeight);
      } catch (err) {
        console.error("Detection error:", err);
      }
    };
    
    const interval = setInterval(processFrame, 500);
    return () => clearInterval(interval);
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
          <div className="video-container" style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
              style={{ width: '100%', display: streamActive ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />
            {!streamActive && (
              <div className="video-placeholder">
                <div className="icon">📷</div>
                <p>Waiting for Webcam access...</p>
              </div>
            )}
            {streamActive && (
              <div className="video-overlay">
                <div className="video-badge">
                  <span className="dot" style={{ width: 6, height: 6 }} />
                  LIVE
                </div>
                <div className="video-badge" style={{ color: 'var(--text-secondary)' }}>
                  Webcam
                </div>
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
