import React, { useState } from 'react';
import styles from './AdReportPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function AdReportPage() {
  const { user } = useAuth();
  const { advertisers } = useData();
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    advertiserId: '',
    product: '', // New field
    platform: '',
    spend: '',
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

    try {
      await addDoc(collection(db, "adSpends"), {
        advertiserId: reportData.advertiserId,
        date: Timestamp.fromDate(new Date(reportData.date)),
        product: reportData.product, // New field
        platform: reportData.platform,
        spend: Number(reportData.spend),
      });

      setSuccessMessage('Laporan Ad Spend berhasil dikirim!');
      setReportData({
        date: new Date().toISOString().split('T')[0],
        advertiserId: '',
        product: '', // New field
        platform: '',
        spend: '',
      });
    } catch (error) {
      setErrorMessage("Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Lapor Ad Spend Harian</h1>
      </div>
      <div className={styles.formContainer}>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Tanggal</label>
            <input type="date" id="date" name="date" value={reportData.date} onChange={handleChange} required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="advertiserId">Nama Advertiser</label>
            <select
              id="advertiserId"
              name="advertiserId"
              value={reportData.advertiserId}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
            >
              <option value="">-- Pilih Advertiser --</option>
              {advertisers.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.name}</option>
              ))}
            </select>
          </div>
          {/* New Field */}
          <div className={styles.formGroup}>
            <label htmlFor="product">Nama Produk</label>
            <input type="text" id="product" name="product" value={reportData.product} onChange={handleChange} placeholder="Contoh: Vitameal" required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="platform">Platform Iklan</label>
            <input type="text" id="platform" name="platform" value={reportData.platform} onChange={handleChange} placeholder="Contoh: Meta" required className={styles.input} disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="spend">Total Spend (Rp)</label>
            <input type="number" id="spend" name="spend" value={reportData.spend} onChange={handleChange} placeholder="Contoh: 500000" required className={styles.input} disabled={loading} />
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