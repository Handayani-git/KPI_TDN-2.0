import React, { useState, useEffect, useMemo } from 'react';
import styles from './SalesReportPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import Table from '../../components/ui/Table/Table';

function SalesReportPage() {
  const { user } = useAuth();
  const { advertisers, customerServices } = useData();
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    csId: '',
    advertiserId: '',
    product: '',
    quantity: '',
    omset: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to fetch sales report history
  const fetchSalesHistory = async () => {
    setLoadingHistory(true);
    const q = query(
      collection(db, "sales"), 
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    setSalesHistory(history);
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchSalesHistory();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await deleteDoc(doc(db, "sales", id));
      await fetchSalesHistory();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await addDoc(collection(db, "sales"), {
        csId: reportData.csId,
        date: Timestamp.fromDate(new Date(reportData.date)),
        advertiserId: reportData.advertiserId,
        product: reportData.product,
        quantity: Number(reportData.quantity),
        omset: Number(reportData.omset),
      });
      setSuccessMessage('Laporan penjualan berhasil dikirim!');
      setReportData({ date: new Date().toISOString().split('T')[0], csId: '', advertiserId: '', product: '', quantity: '', omset: '' });
      await fetchSalesHistory();
    } catch (error) {
        setErrorMessage("Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };
  
  const historyColumns = useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Nama CS', accessor: 'csName' },
    { Header: 'Produk', accessor: 'product' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Aksi', accessor: 'actions' },
  ], []);

  const formattedHistoryData = salesHistory.map(row => {
    const cs = customerServices.find(c => c.id === row.csId);
    return {
      ...row,
      csName: cs ? cs.name : 'Unknown',
      date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(row.date),
      actions: <button onClick={() => handleDelete(row.id)} className={styles.deleteButton}>Hapus</button>
    };
  });

  return (
    <div className={styles.pageLayout}>
      {/* Left Column: Input Form */}
      <div className={styles.formSection}>
        <div className={styles.pageHeader}>
          <h1 className={styles.headerTitle}>Lapor Penjualan (Closing)</h1>
        </div>
        <div className={styles.formContainer}>
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="date">Tanggal Closing</label>
              <input type="date" id="date" name="date" value={reportData.date} onChange={handleChange} required className={styles.input} disabled={loading}/>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="csId">Nama CS</label>
              <select id="csId" name="csId" value={reportData.csId} onChange={handleChange} required className={styles.input} disabled={loading}>
                <option value="">-- Pilih CS --</option>
                {customerServices.map(cs => (<option key={cs.id} value={cs.id}>{cs.name}</option>))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="advertiserId">Lead dari Advertiser</label>
              <select id="advertiserId" name="advertiserId" value={reportData.advertiserId} onChange={handleChange} required className={styles.input} disabled={loading}>
                <option value="">-- Pilih Advertiser --</option>
                {advertisers.map(adv => (<option key={adv.id} value={adv.id}>{adv.name}</option>))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="product">Nama Produk</label>
              <input type="text" id="product" name="product" value={reportData.product} onChange={handleChange} placeholder="Contoh: Vitameal" required className={styles.input} disabled={loading}/>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Kuantitas Terjual</label>
              <input type="number" id="quantity" name="quantity" value={reportData.quantity} onChange={handleChange} placeholder="Contoh: 2" required className={styles.input} disabled={loading}/>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="omset">Total Omset (Rp)</label>
              <input type="number" id="omset" name="omset" value={reportData.omset} onChange={handleChange} placeholder="Contoh: 500000" required className={styles.input} disabled={loading}/>
            </div>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </form>
        </div>
      </div>
      

      {/* Right Column: History Table */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Riwayat Semua Laporan Penjualan</h2>
        {loadingHistory ? (
          <p>Memuat riwayat...</p>
        ) : (
          <Table columns={historyColumns} data={formattedHistoryData} />
        )}
      </div>
    </div>
  );
}

export default SalesReportPage;