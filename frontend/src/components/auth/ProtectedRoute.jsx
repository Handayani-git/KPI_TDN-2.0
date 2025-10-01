import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Komponen ini menerima 'children', yaitu halaman yang akan dirender jika login berhasil.
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Jika tidak ada user yang login, arahkan ke halaman utama (login)
    return <Navigate to="/" />;
  }

  // Jika sudah login, tampilkan halaman yang diminta
  return children;
}

export default ProtectedRoute;