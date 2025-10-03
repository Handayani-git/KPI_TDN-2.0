import React, { useState, useEffect, useMemo } from 'react';
import { getDashboardDataForPeriod } from '../../services/managerService';
import { useData } from '../../contexts/DataContext';

import Card from '../../components/ui/Card/Card';
import Table from '../../components/ui/Table/Table';
import DateRangePickerComponent from '../../components/specific/DateRangePicker/DateRangePicker';
import BarChart from '../../components/ui/Chart/LineChart'; // Menggunakan BarChart
import styles from './ManagerDashboardPage.module.css';

function ManagerDashboardPage() {
  const { customerServices } = useData();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [isAllTime, setIsAllTime] = useState(true);
  const [selectedCS, setSelectedCS] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const startDate = isAllTime ? null : dateRange.startDate;
      const endDate = isAllTime ? null : dateRange.endDate;
      const result = await getDashboardDataForPeriod(startDate, endDate, selectedCS);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [dateRange, isAllTime, selectedCS]);

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
  
  const aggregateAdvColumns = useMemo(() => [
    { Header: 'Nama ADV', accessor: 'name' },
    { Header: 'Gross Omset', accessor: 'grossOmset', isCurrency: true },
    { Header: 'Budget Ads', accessor: 'budgetAds', isCurrency: true },
    { Header: 'ROAS', accessor: 'roas' },
    { Header: 'CAC ADV (%)', accessor: 'cac' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
    { Header: 'Produk/Transaksi', accessor: 'avgProducts' },
  ], []);

  const aggregateCSColumns = useMemo(() => [
    { Header: 'Nama CS', accessor: 'name' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Lead', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
    { Header: 'Closing Rate', accessor: 'closingRate' },
    { Header: 'Produk/Transaksi', accessor: 'avgProducts' },
  ], []);

  const dailyHistoryColumns = useMemo(() => [
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
        <div>
          <div className={styles.pageHeader}>
              <h1 className={styles.headerTitle}>Dashboard Manager</h1>
          </div>
          <p style={{ padding: '2rem' }}>Loading data...</p>
        </div>
    );
  }

  const filteredAdvData = data.current.advertiserPerformance.filter(adv =>
    adv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCSData = data.current.csPerformance.filter(cs =>
    cs.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedHistoryData = data.current.dailyHistory.map(row => ({
    ...row,
    date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(row.date)
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Dashboard Manager</h1>
        <div className={styles.filterContainer}>
          <select 
            value={selectedCS} 
            onChange={(e) => setSelectedCS(e.target.value)} 
            className={styles.selectFilter}
          >
            <option value="all">Semua CS</option>
            {customerServices.map(cs => (
              <option key={cs.id} value={cs.id}>{cs.name}</option>
            ))}
          </select>
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

      <div className={styles.chartSection}>
        <BarChart chartData={data.current.chartData} title="Perbandingan Omset vs. Budget Harian" />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Ringkasan Kinerja (Agregat)</h2>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Cari ADV atau CS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        <h3 className={styles.subTableTitle}>Performa Advertiser</h3>
        <Table columns={aggregateAdvColumns} data={filteredAdvData} />

        <h3 className={styles.subTableTitle} style={{ marginTop: '2rem' }}>Performa Tim CS</h3>
        <Table columns={aggregateCSColumns} data={filteredCSData} />
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Rincian Kinerja Harian</h2>
            <span className={styles.dateSubtitle}>
                {isAllTime 
                ? "Menampilkan Semua Data" 
                : `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
                }
            </span>
        </div>
        <Table columns={dailyHistoryColumns} data={formattedHistoryData} />
      </div>
    </div>
  );
}

export default ManagerDashboardPage;