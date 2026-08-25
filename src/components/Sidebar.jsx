export default function Sidebar({ page, setPage, serverOnline, knownCount }) {
  const navItems = [
    { id: 'dashboard',    icon: '🎥', label: 'Live Feed' },
    { id: 'register',     icon: '➕', label: 'Register Face' },
    { id: 'known',        icon: '👥', label: 'Known Faces' },
  ];

  return (
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
            onClick={() => setPage(item.id)}
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
  );
}
