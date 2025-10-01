import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Sidebar.module.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>KPI Dashboard</h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            {/* Manager Menus */}
            {user?.role === 'manager' && (
              <>
                <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink></li>
                <li><NavLink to="/manage-advertisers" className={({ isActive }) => isActive ? styles.active : ''}>Kelola Advertiser</NavLink></li>
                <li><NavLink to="/manage-cs" className={({ isActive }) => isActive ? styles.active : ''}>Kelola CS</NavLink></li>
              </>
            )}
            {/* CS Menus */}
            {user?.role === 'cs' && (
              <>
                <li><NavLink to="/my-performance" className={({ isActive }) => isActive ? styles.active : ''}>Kinerja Saya</NavLink></li>
                <li><NavLink to="/report/sales" className={({ isActive }) => isActive ? styles.active : ''}>Lapor Penjualan</NavLink></li>
              </>
            )}
            {/* Advertiser Menus */}
             {user?.role === 'adv' && (
              <>
                <li><NavLink to="/adv-performance" className={({ isActive }) => isActive ? styles.active : ''}>Kinerja Iklan</NavLink></li>
                <li><NavLink to="/report/ads" className={({ isActive }) => isActive ? styles.active : ''}>Lapor Kinerja Iklan</NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.email}</span>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;