import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getAdvertiserDashboardDataForPeriod } from '../../services/advertiserService';

import Card from '../../components/ui/Card/Card';
import Table from '../../components/ui/Table/Table';
import DateRangePickerComponent from '../../components/specific/DateRangePicker/DateRangePicker';
import styles from './AdvertiserDashboardPage.module.css';

function AdvertiserDashboardPage() {
  const { user } = useAuth();
  const { advertisers } = useData();
  
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [isAllTime, setIsAllTime] = useState(true);
  const [selectedAdv, setSelectedAdv] = useState('all'); // State untuk filter ADV
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const startDate = isAllTime ? null : dateRange.startDate;
        const endDate = isAllTime ? null : dateRange.endDate;
        const result = await getAdvertiserDashboardDataForPeriod(selectedAdv, startDate, endDate);
        setData(result);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, dateRange, isAllTime, selectedAdv]);

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
    { Header: 'Budget Spend', accessor: 'spend', isCurrency: true },
    { Header: 'Leads', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
  ], []);

  if (loading || !data) {
    return <p>Memuat data kinerja iklan Anda...</p>;
  }

  const formattedHistoryData = data.current.dailyHistory.map(row => ({
      ...row,
      date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(row.date)
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Kinerja Iklan</h1>
        <div className={styles.filterContainer}>
          <select 
            value={selectedAdv} 
            onChange={(e) => setSelectedAdv(e.target.value)} 
            className={styles.selectFilter}
          >
            <option value="all">Semua ADV</option>
            {advertisers.map(adv => (
              <option key={adv.id} value={adv.id}>{adv.name}</option>
            ))}
          </select>

          <button onClick={() => setIsAllTime(true)} className={`${styles.button} ${isAllTime ? styles.activeButton : ''}`}>
            Semua Waktu
          </button>
          <DateRangePickerComponent onDateChange={handleDateChange} />
        </div>
      </div>
      
      <div className={styles.cardGrid}>
        <Card title="Total Omset Dihasilkan" currentValue={data.current.summary.omset} previousValue={data.previous.summary.omset} formatFn={formatRupiah} />
        <Card title="Total Budget Spend" currentValue={data.current.summary.spend} previousValue={data.previous.summary.spend} formatFn={formatRupiah} />
        <Card title="ROAS" currentValue={parseFloat(data.current.summary.roas)} previousValue={parseFloat(data.previous.summary.roas)} />
        <Card title="Total Leads" currentValue={data.current.summary.leads} previousValue={data.previous.summary.leads} />
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

export default AdvertiserDashboardPage;