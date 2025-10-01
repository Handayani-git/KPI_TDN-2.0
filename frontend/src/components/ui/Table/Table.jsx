import React from 'react';
import styles from './Table.module.css';

// Fungsi helper untuk format angka
const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(number);

function Table({ columns, data }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => {
                let cellData = row[col.accessor];
                // Cek apakah kolom ini perlu format Rupiah
                if (col.isCurrency) {
                  cellData = formatRupiah(cellData);
                }
                return <td key={col.accessor}>{cellData}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;