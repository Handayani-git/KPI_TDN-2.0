import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdReportPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import Table from '../../components/ui/Table/Table';

function AdReportPage() {
  const { user } = useAuth();
  const { advertisers } = useData();
  const [adSpendHistory, setAdSpendHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    advertiserId: '',
    product: '',
    platform: '',
    spend: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengambil riwayat laporan
  const fetchAdSpendHistory = async () => {
    setLoadingHistory(true);
    const q = query(
      collection(db, "adSpends"), 
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    setAdSpendHistory(history);
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchAdSpendHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      await deleteDoc(doc(db, "adSpends", id));
      await fetchAdSpendHistory(); // Muat ulang daftar setelah menghapus
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await addDoc(collection(db, "adSpends"), {
        advertiserId: reportData.advertiserId,
        date: Timestamp.fromDate(new Date(reportData.date)),
        product: reportData.product,
        platform: reportData.platform,
        spend: Number(reportData.spend),
      });
      setSuccessMessage('Laporan Ad Spend berhasil dikirim!');
      setReportData({ date: new Date().toISOString().split('T')[0], advertiserId: '', product: '', platform: '', spend: '' });
      await fetchAdSpendHistory(); // Muat ulang daftar setelah menambah
    } catch (error) {
      setErrorMessage("Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  
  const historyColumns = useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Nama ADV', accessor: 'advName' },
    { Header: 'Spend', accessor: 'spend', isCurrency: true },
    { Header: 'Aksi', accessor: 'actions' },
  ], []);

  const formattedHistoryData = adSpendHistory.map(row => {
    const adv = advertisers.find(a => a.id === row.advertiserId);
    return {
      ...row,
      advName: adv ? adv.name : 'Unknown',
      date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(row.date),
      actions: <button onClick={() => handleDelete(row.id)} className={styles.deleteButton}>Hapus</button>
    };
  });

  return (
    <div className={styles.pageLayout}>
      {/* Kolom Kiri: Form Input */}
      <div className={styles.formSection}>
        <div className={styles.pageHeader}>
          <h1 className={styles.headerTitle}>Lapor Ad Spend Harian</h1>
        </div>
        <div className={styles.formContainer}>
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}><label htmlFor="date">Tanggal</label><input type="date" id="date" name="date" value={reportData.date} onChange={handleChange} required className={styles.input} disabled={loading} /></div>
            <div className={styles.formGroup}><label htmlFor="advertiserId">Nama Advertiser</label><select id="advertiserId" name="advertiserId" value={reportData.advertiserId} onChange={handleChange} required className={styles.input} disabled={loading}><option value="">-- Pilih Advertiser --</option>{advertisers.map(adv => (<option key={adv.id} value={adv.id}>{adv.name}</option>))}</select></div>
            <div className={styles.formGroup}><label htmlFor="product">Nama Produk</label><input type="text" id="product" name="product" value={reportData.product} onChange={handleChange} placeholder="Contoh: Vitameal" required className={styles.input} disabled={loading} /></div>
            <div className={styles.formGroup}><label htmlFor="platform">Platform Iklan</label><input type="text" id="platform" name="platform" value={reportData.platform} onChange={handleChange} placeholder="Contoh: Meta" required className={styles.input} disabled={loading} /></div>
            <div className={styles.formGroup}><label htmlFor="spend">Total Spend (Rp)</label><input type="number" id="spend" name="spend" value={reportData.spend} onChange={handleChange} placeholder="Contoh: 500000" required className={styles.input} disabled={loading} /></div>
            <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Laporan'}</button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Tabel Riwayat */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Riwayat Laporan Ad Spend</h2>
        {loadingHistory ? (
          <p>Memuat riwayat...</p>
        ) : (
          <Table columns={historyColumns} data={formattedHistoryData} />
        )}
      </div>
    </div>
  );
}

export default AdReportPage;