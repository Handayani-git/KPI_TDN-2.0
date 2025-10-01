import React from 'react';
import Table from '../../ui/Table/Table';

const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
}

function CSPerformanceTable({ data }) {
  const columns = React.useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Nama CS', accessor: 'csName' },
    { Header: 'Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Lead', accessor: 'leads' },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
  ], []);
  
  const formattedData = data.map(row => ({
    ...row,
    date: formatShortDate(row.date)
  }));

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className="text-xl font-semibold text-secondary mb-4">Rincian Kinerja Tim CS Harian</h2>
      <Table columns={columns} data={formattedData} />
    </div>
  );
}

export default CSPerformanceTable;