import React from 'react';
import Table from '../../ui/Table/Table';

// Fungsi untuk format tanggal agar lebih singkat di tabel
const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
}

function DailyPerformanceTable({ data }) {
  const columns = React.useMemo(() => [
    { Header: 'Tanggal', accessor: 'date', Cell: ({ value }) => formatShortDate(value) }, // Format tanggal
    { Header: 'Nama ADV', accessor: 'advertiserName' },
    { Header: 'Nama CS', accessor: 'csName' },
    { Header: 'Spend', accessor: 'spend', isCurrency: true },
    { Header: 'Leads', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
  ], []);

  // Perlu sedikit penyesuaian pada komponen Table kita agar bisa handle custom cell
  // Untuk sementara, kita buat custom render di sini
  const customData = data.map(row => ({
      ...row,
      date: formatShortDate(row.date) // Ubah data tanggalnya langsung
  }))

  const displayColumns = columns.slice(0, 7); // Hapus kolom Cell agar tidak error
  displayColumns[0].accessor = 'date';


  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className="text-xl font-semibold text-secondary mb-4">Riwayat Kinerja Harian</h2>
      <Table columns={displayColumns} data={customData} />
    </div>
  );
}

export default DailyPerformanceTable;