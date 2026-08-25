import { useState, useEffect, useRef } from 'react';
import { detectFaces } from '../api';

export default function Dashboard({ serverOnline }) {
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
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h2>Live Recognition Scanner</h2>
        <p>Real-time facial recognition from your webcam</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', width: '100%', maxWidth: 700 }}>
          <div className="video-container" style={{ position: 'relative', minHeight: 400, backgroundColor: '#000' }}>
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
              <div className="video-placeholder" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="icon" style={{ fontSize: 40 }}>📷</div>
                <p style={{ marginTop: 12 }}>Waiting for Webcam access...</p>
              </div>
            )}
            {streamActive && (
              <div className="video-overlay" style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                <div className="video-badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 12 }}>
                  <span className="dot" style={{ width: 8, height: 8, backgroundColor: serverOnline ? '#00FF80' : '#FF5000', borderRadius: '50%' }} />
                  {serverOnline ? 'SERVER ONLINE' : 'SERVER OFFLINE'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
