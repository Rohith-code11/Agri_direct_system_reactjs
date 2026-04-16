import { useCallback, useState } from 'react';
import './assets/global.css';
import HomeAuthentication from './screens/pages/home/authentication';
import ReviewAndRatingsAuthentication from './screens/pages/review-and-ratings/authentication';
import Navbar from './reusable-components/Navbar';
import GrowerDashboard from './screens/pages/dashboard/GrowerDashboard';
import BuyerDashboard from './screens/pages/dashboard/BuyerDashboard';
import Inventory from './screens/pages/dashboard/Inventory';
import Marketplace from './screens/pages/dashboard/Marketplace';
import Profile from './screens/pages/profile/Profile';
import Cart from './screens/pages/cart/Cart';
import Orders from './screens/pages/orders/Orders';
import Notifications from './screens/pages/notifications/Notifications';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

function App() {
  const [authUser, setAuthUser] = useState(getStoredUser);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const onLoginSuccess = ({ token, user }) => {
    if (token) {
      localStorage.setItem('authToken', token);
      setAuthToken(token);
    }

    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
      setAuthUser(user);
      setActiveMenu('Dashboard');
    }
  };

  const onLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthToken(null);
    setAuthUser(null);
    setActiveMenu('Dashboard');
  };

  const onUserRefresh = useCallback((user) => {
    if (!user) {
      return;
    }
    localStorage.setItem('authUser', JSON.stringify(user));
    setAuthUser(user);
  }, []);

  const role = authUser?.userType?.toLowerCase();

  const renderContent = () => {
    if (activeMenu === 'Profile') {
      return <Profile user={authUser} token={authToken} onUserRefresh={onUserRefresh} />;
    }

    if (role === 'grower') {
      if (activeMenu === 'Inventory') {
        return <Inventory token={authToken} />;
      }
      if (activeMenu === 'Orders') {
        return <Orders token={authToken} role="grower" />;
      }
      if (activeMenu === 'Notifications') {
        return <Notifications token={authToken} />;
      }
      return <GrowerDashboard user={authUser} token={authToken} />;
    }

    if (activeMenu === 'Marketplace') {
      return <Marketplace token={authToken} />;
    }

    if (activeMenu === 'Cart') {
      return <Cart token={authToken} onCheckoutComplete={() => setActiveMenu('Orders')} />;
    }

    if (activeMenu === 'Orders') {
      return <Orders token={authToken} role="buyer" />;
    }

    if (activeMenu === 'Notifications') {
      return <Notifications token={authToken} />;
    }

    return <BuyerDashboard user={authUser} token={authToken} />;
  };

  if (authUser && authToken) {
    return (
      <main className="app-shell">
        <Navbar user={authUser} onLogout={onLogout} activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        {renderContent()}
      </main>
    );
  }

  return (
    <main className="app-shell">
      <HomeAuthentication onLoginSuccess={onLoginSuccess} />
      <ReviewAndRatingsAuthentication />
    </main>
  );
}

export default App;
