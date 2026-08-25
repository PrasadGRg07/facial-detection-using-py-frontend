import { useState } from 'react';

export default function Sidebar({ page, setPage, serverOnline, knownCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: '🎥', label: 'Live Feed' },
    { id: 'register',  icon: '➕', label: 'Register' },
    { id: 'admin',     icon: '🔒', label: 'Admin' },
  ];

  const handleNav = (id) => {
    setPage(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🧠</div>
          <div>
            <h1>FaceID</h1>
            <span>Recognition System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="status-dot">
            <span className={`dot ${serverOnline ? '' : 'offline'}`} />
            {serverOnline
              ? `Online · ${knownCount} face${knownCount !== 1 ? 's' : ''}`
              : 'Backend offline'}
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────── */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <span className="logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>🧠</span>
          <span className="mobile-logo-text">FaceID</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`dot ${serverOnline ? '' : 'offline'}`} style={{ width: 8, height: 8 }} />
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu ──────────────────────── */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ─────────────────────── */}
      <nav className="mobile-tabs">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-tab ${page === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item.id)}
          >
            <span className="mobile-tab-icon">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
