const ROLE_MENUS = {
  grower: ['Dashboard', 'Inventory', 'Orders', 'Notifications', 'Profile'],
  buyer: ['Dashboard', 'Marketplace', 'Cart', 'Orders', 'Notifications', 'Profile']
};

const Navbar = ({ user, onLogout, activeMenu, onMenuChange }) => {
  const role = user?.userType?.toLowerCase() || 'buyer';
  const menuItems = ROLE_MENUS[role] || ['Dashboard', 'Profile'];
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="dashboard-navbar">
      <div className="dashboard-navbar-top">
        <div className="dashboard-brand-wrap">
          <div className="dashboard-brand-logo" aria-hidden="true">
            <span>AG</span>
          </div>
          <div>
            <p className="dashboard-navbar-eyebrow">AgriDirect Exchange</p>
            <h1>Welcome, {user?.name || 'User'}</h1>
            <p className="dashboard-navbar-meta">{today} • {user?.county || 'Region not set'}</p>
          </div>
        </div>

        <div className="dashboard-navbar-actions">
          <div className="dashboard-user-summary">
            <span className="dashboard-role-badge">{user?.userType || 'member'}</span>
            <small>{user?.email || 'No email'}</small>
          </div>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <nav className="dashboard-menu" aria-label="Dashboard Menu">
        {menuItems.map((menu) => (
          <button
            key={menu}
            type="button"
            className={`dashboard-menu-item ${activeMenu === menu ? 'active' : ''}`}
            onClick={() => onMenuChange(menu)}
          >
            {menu}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
