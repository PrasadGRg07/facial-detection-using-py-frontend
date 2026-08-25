import { useState } from 'react';
import { removeFace } from '../api';

export default function KnownFaces({ faces, onRefresh, addToast }) {
  const [removing, setRemoving] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleRemove = async (name) => {
    setRemoving(name);
    try {
      const res = await removeFace(name);
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
          <h2>Known Faces</h2>
          <p>{faces.length} registered face{faces.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="refresh-faces-btn" className="btn btn-ghost btn-sm" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="card">
        {faces.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👤</div>
            <p>No faces registered yet.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Go to "Register Face" to add your first person.</p>
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
    </div>
  );
}
