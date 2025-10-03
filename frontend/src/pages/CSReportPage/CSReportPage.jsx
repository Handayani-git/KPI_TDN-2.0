import React, { useState } from 'react';
import styles from './CSReportPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function CSReportPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    omset: '',
    closing: '',
    quantity: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!user || !user.id) {
        setErrorMessage("Data pengguna tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
    }

    try {
      await addDoc(collection(db, "dailyPerformance"), {
        csId: user.id,
        advertiserId: null,
        date: Timestamp.fromDate(new Date(reportData.date)),
        omset: Number(reportData.omset),
        closing: Number(reportData.closing),
        quantity: Number(reportData.quantity),
        spend: 0,
        leads: 0,
      });

      setSuccessMessage('Laporan berhasil dikirim!');
      setReportData({ date: new Date().toISOString().split('T')[0], omset: '', closing: '', quantity: '' });
    } catch (error) {
      console.error("Error submitting report:", error);
      setErrorMessage("Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccessMessage(''); setErrorMessage(''); }, 4000);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Lapor Kinerja Penjualan Harian</h1>
      </div>
      <div className={styles.formContainer}>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Tanggal Laporan</label>
            <input type="date" id="date" name="date" value={reportData.date} onChange={handleChange} required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="omset">Total Omset (Rp)</label>
            <input type="number" id="omset" name="omset" value={reportData.omset} onChange={handleChange} placeholder="Contoh: 5000000" required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="closing">Jumlah Closing</label>
            <input type="number" id="closing" name="closing" value={reportData.closing} onChange={handleChange} placeholder="Contoh: 10" required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quantity">Jumlah Kuantitas Produk Terjual</label>
            <input type="number" id="quantity" name="quantity" value={reportData.quantity} onChange={handleChange} placeholder="Contoh: 20" required className={styles.input} disabled={loading} />
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CSReportPage;