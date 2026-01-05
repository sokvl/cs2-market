import React, { useContext, useEffect, useState } from 'react';
import '../styles/contact.css';
import './UserDashboard.css';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import { useAppState } from '../lib/AppStateManager';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Inventory from '../components/dashboardContent/Inventory';
import WalletManagment from '../components/dashboardContent/WalletManagment';
import Settings from '../components/dashboardContent/Settings';
import UserOffers from '../components/dashboardContent/Offers';
import Delivery from '../components/dashboardContent/Delivery';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AuthContext from '../lib/AuthContext';
import AdminPanel from '../components/dashboardContent/AdminPanel';
import PrivateRoute from '../utils/PrivateRoute';

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { isDarkMode } = useTheme();

  const { user } = useContext(AuthContext)

  const [isAdmin, setIsAdmin] = useState(false);

  if (!user) {
    window.location.href = '/'
  }

  const [walletBalance, setWalletBalance] = useState({});
  const [tradeLink, setTradelink] = useState("Please provide tradelink!");
  useEffect(() => {
    const getUserBalance = async () => {
      await axios.get(`http://localhost:8000/users/wallet/${user?.steam_id}/`)
      .then(res => setWalletBalance(res.data))
      .catch(err => console.log(err))


      await axios.get(`http://localhost:8000/users/${user?.steam_id}`)
      .then(res => {setTradelink(res.data.steam_tradelink); setIsAdmin(res.data.is_admin)})
      .catch(err => console.log(err))
    }
    getUserBalance()
  }, [user?.steam_id]);

  const getLinkClassName = (pathname) => {
    return location.pathname === pathname ? 'dashboard-nav-link active' : 'dashboard-nav-link';
  };

  return (
    <div className={`dashboard-wrapper ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="dashboard-background">
        <div className="dashboard-orb orb-1"></div>
        <div className="dashboard-orb orb-2"></div>
        <div className="dashboard-orb orb-3"></div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-user-card">
              <div className="user-avatar-wrapper">
                <img src={user?.avatar} className="user-avatar-large" alt="User Avatar" />
                <div className="user-status-badge"></div>
              </div>
              <h2 className="user-name">{user?.username}</h2>
              <div className="user-balance">
                <i className="fa-solid fa-wallet"></i>
                <span>${walletBalance.balance || '0.00'}</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">
                <span className="nav-section-title">Main Menu</span>
                <Link to={'/UserDashboard/Settings'} className={getLinkClassName('/UserDashboard/Settings')}>
                  <i className="fa-solid fa-gear"></i>
                  <span>Settings</span>
                  <i className="fa-solid fa-chevron-right nav-arrow"></i>
                </Link>
                <Link to={'/UserDashboard/Inventory'} className={getLinkClassName('/UserDashboard/Inventory')}>
                  <i className="fa-solid fa-briefcase"></i>
                  <span>Inventory</span>
                  <i className="fa-solid fa-chevron-right nav-arrow"></i>
                </Link>
                <Link to={'/UserDashboard/Wallet'} className={getLinkClassName('/UserDashboard/Wallet')}>
                  <i className="fa-solid fa-wallet"></i>
                  <span>Wallet</span>
                  <i className="fa-solid fa-chevron-right nav-arrow"></i>
                </Link>
              </div>

              <div className="nav-section">
                <span className="nav-section-title">Trading</span>
                <Link to={'/UserDashboard/ActiveOffers'} className={getLinkClassName('/UserDashboard/ActiveOffers')}>
                  <i className="fa-solid fa-money-bill"></i>
                  <span>Active Offers</span>
                  <i className="fa-solid fa-chevron-right nav-arrow"></i>
                </Link>
                <Link to={'/UserDashboard/Delivery'} className={getLinkClassName('/UserDashboard/Delivery')}>
                  <i className="fa-solid fa-truck"></i>
                  <span>Delivery</span>
                  <i className="fa-solid fa-chevron-right nav-arrow"></i>
                </Link>
              </div>

              {isAdmin && (
                <div className="nav-section">
                  <span className="nav-section-title">Administration</span>
                  <Link to={'/UserDashboard/AdminPanel'} className={getLinkClassName('/UserDashboard/AdminPanel')}>
                    <i className="fa-solid fa-crown"></i>
                    <span>Admin Panel</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </div>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="dashboard-main-content">
              <ErrorBoundary>
                {location.pathname === '/UserDashboard/Settings' && <Settings tl={tradeLink} steamid={user?.steam_id}/>}
                {location.pathname === '/UserDashboard/Inventory' && <Inventory />}
                {location.pathname === '/UserDashboard/Wallet' && <WalletManagment walletOwner={user?.steam_id} balance={walletBalance.balance}/>}
                {location.pathname === '/UserDashboard/ActiveOffers' && <UserOffers creatorId={user?.steam_id}></UserOffers>}
                {location.pathname === '/UserDashboard/Delivery' && <Delivery ownerId={user?.steam_id}/>}
                {location.pathname === '/UserDashboard/AdminPanel' && <AdminPanel steamid={user?.steam_id}/>}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
