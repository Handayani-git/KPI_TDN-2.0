import React from 'react';
import Table from '../../ui/Table/Table';

const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
}

function AdvertiserPerformanceTable({ data }) {
  const columns = React.useMemo(() => [
    { Header: 'Tanggal', accessor: 'date' },
    { Header: 'Nama ADV', accessor: 'advertiserName' },
    { Header: 'Gross Omset', accessor: 'omset', isCurrency: true },
    { Header: 'Budget Ads', accessor: 'spend', isCurrency: true },
    { Header: 'Closing', accessor: 'closing' },
    { Header: 'QTY', accessor: 'quantity' },
  ], []);

  const formattedData = data.map(row => ({
    ...row,
    date: formatShortDate(row.date)
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary mb-4">Rincian Kinerja Advertiser Harian</h2>
      <Table columns={columns} data={formattedData} />
    </div>
  );
}

export default AdvertiserPerformanceTable;