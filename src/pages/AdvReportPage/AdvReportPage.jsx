import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import styles from './AdvReportPage.module.css';

function AdvReportPage() {
  const { user } = useAuth();
  const { addDailyReport } = useData();

  const [date, setDate] = useState('');
  const [spend, setSpend] = useState('');
  const [leads, setLeads] = useState('');
  const [message, setMessage] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();

    if (!date || !spend || !leads) {
      setMessage('Harap isi semua kolom!');
      return;
    }

    const newReport = {
      id: `adv-${Date.now()}`,
      date: date,
      advertiserId: user.id,
      spend: parseFloat(spend),
      leads: parseInt(leads, 10),
      omset: 0,
      closing: 0,
      quantity: 0,
    };

    addDailyReport(newReport);
    setMessage('Laporan berhasil dikirim!');

    // Reset formulir
    setDate('');
    setSpend('');
    setLeads('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Buat Laporan Iklan Harian</h1>
      <form onSubmit={handleReportSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>Tanggal:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="spend" className={styles.label}>Total Budget Spend:</label>
          <input
            type="number"
            id="spend"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="leads" className={styles.label}>Jumlah Leads:</label>
          <input
            type="number"
            id="leads"
            value={leads}
            onChange={(e) => setLeads(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Kirim Laporan</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default AdvReportPage;