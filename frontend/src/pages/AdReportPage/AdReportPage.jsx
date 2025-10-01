import React, { useState } from 'react';
import styles from './AdReportPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function AdReportPage() {
  const { user } = useAuth(); // Ambil data user yang sedang login
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    spend: '',
    leads: '',
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

    if (!user || user.role !== 'advertiser') {
      setErrorMessage("Anda tidak memiliki hak akses untuk mengirim laporan ini.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "dailyPerformance"), {
        advertiserId: user.id, // ID dari user ADV yang login
        csId: null,
        date: Timestamp.fromDate(new Date(reportData.date)),
        spend: Number(reportData.spend),
        leads: Number(reportData.leads),
        omset: 0,
        closing: 0,
        quantity: 0,
      });

      setSuccessMessage('Laporan berhasil dikirim!');
      setReportData({
        date: new Date().toISOString().split('T')[0],
        spend: '',
        leads: '',
      });

    } catch (error) {
      console.error("Error submitting report:", error);
      setErrorMessage("Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 4000);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Lapor Kinerja Iklan Harian</h1>
      </div>

      <div className={styles.formContainer}>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          {/* ... sisa form tidak berubah ... */}
          <div className={styles.formGroup}>
            <label htmlFor="date">Tanggal Laporan</label>
            <input type="date" id="date" name="date" value={reportData.date} onChange={handleChange} required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="spend">Total Budget Spend (Rp)</label>
            <input type="number" id="spend" name="spend" value={reportData.spend} onChange={handleChange} placeholder="Contoh: 500000" required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="leads">Jumlah Leads Didapat</label>
            <input type="number" id="leads" name="leads" value={reportData.leads} onChange={handleChange} placeholder="Contoh: 25" required className={styles.input} disabled={loading} />
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdReportPage;