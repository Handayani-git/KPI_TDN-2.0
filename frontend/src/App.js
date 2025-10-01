import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout/Layout';
import LoginPage from './pages/LoginPage/LoginPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage/ManagerDashboardPage';
import CSDashboardPage from './pages/CSDashboardPage/CSDashboardPage';
import ManageAdvertisersPage from './pages/ManageAdvertisersPage/ManageAdvertisersPage';
import ManageCSPage from './pages/ManageCSPage/ManageCSPage';
import AdReportPage from './pages/AdReportPage/AdReportPage';
import SalesReportPage from './pages/SalesReportPage/SalesReportPage';
import AdvertiserDashboardPage from './pages/AdvertiserDashboardPage/AdvertiserDashboardPage';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            
            {/* Rute-rute ini dilindungi dan menggunakan Layout dengan Sidebar */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ManagerDashboardPage />} />
              <Route path="/my-performance" element={<CSDashboardPage />} />
              <Route path="/adv-performance" element={<AdvertiserDashboardPage />} />
              <Route path="/manage-advertisers" element={<ManageAdvertisersPage />} />
              <Route path="/manage-cs" element={<ManageCSPage />} />
              <Route path="/report/ads" element={<AdReportPage />} />
              <Route path="/report/sales" element={<SalesReportPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;