import React, { useState, useEffect } from 'react';
import { getDashboardDataForPeriod } from '../../services/kpiService';

import Card from '../../components/ui/Card/Card';
import Table from '../../components/ui/Table/Table';
import DateRangePickerComponent from '../../components/specific/DateRangePicker/DateRangePicker';
import LineChart from '../../components/ui/Chart/LineChart'; // <-- Impor komponen grafik
import styles from './ManagerDashboardPage.module.css';

function ManagerDashboardPage() {
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [isAllTime, setIsAllTime] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const startDate = isAllTime ? null : dateRange.startDate;
    const endDate = isAllTime ? null : dateRange.endDate;
    const result = getDashboardDataForPeriod(startDate, endDate);
    setData(result);
    setLoading(false);
  }, [dateRange, isAllTime]);

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    setIsAllTime(false);
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(number);

  const formatDate = (date) => new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(date);

  const aggregateAdvColumns = React.useMemo(() => [
    { Header: 'Nama ADV', accessor: 'name' },
    { Header: 'Gross Omset', accessor: 'grossOmset', isCurrency: true },
    { Header: 'Budget Ads', accessor: 'budgetAds', isCurrency: true },
    { Header: 'ROAS', accessor: 'roas' },
    { Header: 'CAC ADV (%)', accessor: 'cac' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
    { Header: 'Produk/Transaksi', accessor: 'avgProducts' },
  ], []);

  const aggregateCSColumns = React.useMemo(() => [
    { Header: 'Nama CS', accessor: 'name' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Lead', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
    { Header: 'Closing Rate', accessor: 'closingRate' },
    { Header: 'Produk/Transaksi', accessor: 'avgProducts' },
  ], []);

  const dailyHistoryColumns = React.useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Nama ADV', accessor: 'advertiserName' },
    { Header: 'Nama CS', accessor: 'csName' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Spend', accessor: 'spend', isCurrency: true },
    { Header: 'Leads', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
  ], []);

  if (loading || !data) {
    return (
        <div className={styles.pageHeader}>
            <h1 className={styles.headerTitle}>Dashboard Manager</h1>
            <p>Loading data...</p>
        </div>
    );
  }
  
  const formattedHistoryData = data.current.dailyHistory.map(row => ({
    ...row,
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.date))
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Dashboard Manager</h1>
        <div className={styles.filterContainer}>
          <button 
            onClick={() => setIsAllTime(true)} 
            className={`${styles.button} ${isAllTime ? styles.activeButton : ''}`}
          >
            Semua Waktu
          </button>
          <DateRangePickerComponent onDateChange={handleDateChange} />
        </div>
      </div>
      
      <div className={styles.cardGrid}>
        <Card title="Gross Omset" currentValue={data.current.summary.grossOmset} previousValue={data.previous.summary.grossOmset} formatFn={formatRupiah}/>
        <Card title="Budget Ads" currentValue={data.current.summary.budgetAds} previousValue={data.previous.summary.budgetAds} formatFn={formatRupiah}/>
        <Card title="ROAS" currentValue={parseFloat(data.current.summary.roas)} previousValue={parseFloat(data.previous.summary.roas)}/>
        <Card title="Total Closing" currentValue={data.current.summary.totalClosing} previousValue={data.previous.summary.totalClosing}/>
      </div>

      {/* --- BAGIAN GRAFIK --- */}
      <div className={styles.chartSection}>
        <LineChart chartData={data.current.chartData} title="Tren Omset Harian" />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Ringkasan Kinerja (Agregat)</h2>
          <span className={styles.dateSubtitle}>
            {isAllTime 
              ? "Menampilkan Semua Data" 
              : `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
            }
          </span>
        </div>
        
        <h3 className={styles.subTableTitle}>Performa Advertiser</h3>
        <Table columns={aggregateAdvColumns} data={data.current.advertiserPerformance} />

        <h3 className={styles.subTableTitle} style={{ marginTop: '2rem' }}>Performa Tim CS</h3>
        <Table columns={aggregateCSColumns} data={data.current.csPerformance} />
      </div>

      <div className={styles.tableSection}>
        <h2 className={styles.tableTitle}>Rincian Kinerja Harian</h2>
        <Table columns={dailyHistoryColumns} data={formattedHistoryData} />
      </div>
    </div>
  );
}

export default ManagerDashboardPage;