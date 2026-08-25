import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import RegisterFace from './pages/RegisterFace';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { getStatus, getKnownFaces, getDetectionLog } from './api';
import './index.css';

let toastId = 0;

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [serverOnline, setServerOnline] = useState(false);
  const [knownFaces, setKnownFaces] = useState([]);
  const [detectionLog, setDetectionLog] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [adminToken, setAdminToken] = useState(null);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const refreshFaces = useCallback(async () => {
    try {
      const data = await getKnownFaces();
      setKnownFaces(data.faces || []);
    } catch {}
  }, []);

  // Poll server status + detection log every 2s
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const status = await getStatus();
        if (!mounted) return;
        setServerOnline(true);
        setKnownFaces(status.names || []);
      } catch {
        if (mounted) setServerOnline(false);
      }

      try {
        const log = await getDetectionLog();
        if (!mounted) return;
        setDetectionLog(log.log || []);
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const pages = {
    dashboard: (
      <Dashboard serverOnline={serverOnline} />
    ),
    register: (
      <RegisterFace
        onSuccess={refreshFaces}
        addToast={addToast}
      />
    ),
    admin: adminToken ? (
      <AdminDashboard
        faces={knownFaces}
        detectionLog={detectionLog}
        onRefresh={refreshFaces}
        addToast={addToast}
        token={adminToken}
        onLogout={() => { setAdminToken(null); addToast('Logged out', 'success'); }}
      />
    ) : (
      <AdminLogin
        onLogin={setAdminToken}
        addToast={addToast}
      />
    ),
  };

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        serverOnline={serverOnline}
        knownCount={knownFaces.length}
      />
      <main className="main-content">
        {pages[page]}
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
