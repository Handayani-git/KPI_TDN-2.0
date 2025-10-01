import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {/* <Outlet> akan merender komponen halaman (misal: ManagerDashboardPage) */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;