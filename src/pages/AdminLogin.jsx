import { useState } from 'react';
import { adminLogin } from '../api';

export default function AdminLogin({ onLogin, addToast }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const res = await adminLogin(password);
      onLogin(res.token);
      addToast('Logged in successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="card-header">
        <h2 className="card-title">Admin Login</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0' }}>
        <div className="form-group">
          <label className="form-label">Admin Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !password}>
          {loading ? <span className="spinner light" /> : 'Login'}
        </button>
      </form>
    </div>
  );
}
