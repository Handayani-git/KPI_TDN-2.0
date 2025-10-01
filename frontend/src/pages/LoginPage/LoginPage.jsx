// src/pages/LoginPage/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css'; // <-- Pastikan impor ini benar

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // ... (Sisa logika useEffect dan handleSubmit tetap sama)
  // Di dalam LoginPage.jsx

const handleSubmit = async (event) => { // <-- Jadikan async
  event.preventDefault();
  setError('');
  try {
    await login(email, password); // <-- Tambahkan await
    // Navigasi akan ditangani otomatis oleh useEffect di AuthContext dan ProtectedRoute
  } catch (error) {
    setError('Email atau password salah. Silakan coba lagi.');
    console.error("Login failed:", error);
  }
};

   useEffect(() => {
    if (user) {
      navigate(user.role === 'manager' ? '/dashboard' : '/my-performance');
    }
  }, [user, navigate]);


  return (
    // Pastikan semua className menggunakan object 'styles'
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h2>KPI Dashboard</h2>
          <p>Silakan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="manager@app.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="password"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;