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
import AdvReportPage from './pages/AdvReportPage/AdvReportPage';
import CSReportPage from './pages/CSReportPage/CSReportPage';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ManagerDashboardPage />} />
              <Route path="/my-performance" element={<CSDashboardPage />} />
              <Route path="/manage-advertisers" element={<ManageAdvertisersPage />} />
              <Route path="/report-adv" element={<AdvReportPage />} />
              <Route path="/report-cs" element={<CSReportPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;