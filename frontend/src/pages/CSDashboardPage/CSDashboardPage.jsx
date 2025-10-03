import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCSDashboardDataForPeriod } from '../../services/kpiService';

import Card from '../../components/ui/Card/Card';
import Table from '../../components/ui/Table/Table';
import DateRangePickerComponent from '../../components/specific/DateRangePicker/DateRangePicker';
import styles from './CSDashboardPage.module.css';

function CSDashboardPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [isAllTime, setIsAllTime] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      const fetchData = async () => {
        setLoading(true);
        const startDate = isAllTime ? null : dateRange.startDate;
        const endDate = isAllTime ? null : dateRange.endDate;
        const result = await getCSDashboardDataForPeriod(user.id, startDate, endDate);
        setData(result);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, dateRange, isAllTime]);

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    setIsAllTime(false);
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(number);

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    }).format(date);
  };

  const historyColumns = useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Leads', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
  ], []);

  if (loading || !data) {
    return <p>Loading your performance data...</p>;
  }

  const formattedHistoryData = data.current.dailyHistory.map(row => ({
      ...row,
      date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(row.date)
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Kinerja Saya</h1>
        <div className={styles.filterContainer}>
          <button onClick={() => setIsAllTime(true)} className={`${styles.button} ${isAllTime ? styles.activeButton : ''}`}>
            Semua Waktu
          </button>
          <DateRangePickerComponent onDateChange={handleDateChange} />
        </div>
      </div>
      
      <div className={styles.cardGrid}>
        <Card title="Omset Anda" currentValue={data.current.summary.omset} previousValue={data.previous.summary.omset} formatFn={formatRupiah} />
        <Card title="Leads Diterima" currentValue={data.current.summary.leads} previousValue={data.previous.summary.leads} />
        <Card title="Closing Berhasil" currentValue={data.current.summary.closing} previousValue={data.previous.summary.closing} />
        <Card title="Closing Rate" currentValue={parseFloat(data.current.summary.closingRate)} previousValue={parseFloat(data.previous.summary.closingRate)} formatFn={(val) => `${val.toFixed(1)}%`} />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Riwayat Kinerja Harian</h2>
          <span className={styles.dateSubtitle}>
            {isAllTime ? "Menampilkan Semua Data" : `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`}
          </span>
        </div>
        <Table columns={historyColumns} data={formattedHistoryData} />
      </div>
    </div>
  );
}

export default CSDashboardPage;