import { useState } from 'react';
import { removeFace } from '../api';

export default function AdminDashboard({ faces, detectionLog, onRefresh, addToast, token, onLogout }) {
  const [removing, setRemoving] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleRemove = async (name) => {
    setRemoving(name);
    try {
      const res = await removeFace(name, token);
      addToast(res.message || `'${name}' removed.`, 'success');
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Failed to remove face.', 'error');
    } finally {
      setRemoving(null);
      setConfirmDelete(null);
    }
  };

  const initials = (name) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage registered faces and view detection logs</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
            🔄 Refresh
          </button>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Manage Faces */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Registered Faces</span>
            <span className="text-muted text-sm">{faces.length} total</span>
          </div>

          {faces.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="icon">👤</div>
              <p style={{ marginTop: 8 }}>No faces registered.</p>
            </div>
          ) : (
            <div className="face-grid">
              {faces.map((name) => (
                <div key={name} className="face-card">
                  <div className="face-avatar">{initials(name)}</div>
                  <div className="face-name">{name}</div>

                  {confirmDelete === name ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                        Are you sure?
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(name)}
                        disabled={removing === name}
                        style={{ width: '100%' }}
                      >
                        {removing === name ? <span className="spinner light" /> : '🗑️ Yes, delete'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirmDelete(null)}
                        style={{ width: '100%' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDelete(name)}
                      style={{ width: '100%' }}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
