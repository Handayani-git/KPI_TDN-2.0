import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import styles from './CSReportPage.module.css';

function CSReportPage() {
  const { user } = useAuth();
  const { advertisers, addDailyReport } = useData();

  const [date, setDate] = useState('');
  const [advId, setAdvId] = useState('');
  const [omset, setOmset] = useState('');
  const [closing, setClosing] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();

    if (!date || !advId || !omset || !closing || !quantity) {
      setMessage('Harap isi semua kolom!');
      return;
    }

    const newReport = {
      id: `cs-${Date.now()}`,
      date: date,
      advertiserId: advId,
      csId: user.id,
      omset: parseFloat(omset),
      closing: parseInt(closing, 10),
      quantity: parseInt(quantity, 10),
      spend: 0,
      leads: 0,
    };

    addDailyReport(newReport);
    setMessage('Laporan berhasil dikirim!');

    // Reset formulir
    setDate('');
    setAdvId('');
    setOmset('');
    setClosing('');
    setQuantity('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Buat Laporan Penjualan Harian</h1>
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
          <label htmlFor="advertiser" className={styles.label}>Nama Advertiser:</label>
          <select
            id="advertiser"
            value={advId}
            onChange={(e) => setAdvId(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Pilih Advertiser</option>
            {advertisers.map(adv => (
              <option key={adv.id} value={adv.id}>{adv.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="omset" className={styles.label}>Total Omset:</label>
          <input
            type="number"
            id="omset"
            value={omset}
            onChange={(e) => setOmset(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="closing" className={styles.label}>Jumlah Closing:</label>
          <input
            type="number"
            id="closing"
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="quantity" className={styles.label}>Jumlah Produk Terjual (QTY):</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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

export default CSReportPage;