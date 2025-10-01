import React from 'react';
import styles from './Card.module.css';

// --- FUNGSI YANG DIPERBARUI ---
const calculateChange = (current, previous) => {
  // Pastikan nilai adalah angka
  const currentNum = parseFloat(current);
  const previousNum = parseFloat(previous);

  // Handle jika data tidak valid
  if (isNaN(currentNum) || isNaN(previousNum)) {
    return { value: '-', isPositive: null };
  }
  
  // Jika nilai sebelumnya 0
  if (previousNum === 0) {
    if (currentNum > 0) {
      // Ada pertumbuhan dari nol, tampilkan strip daripada infinity
      return { value: '-', isPositive: true }; 
    }
    // Jika keduanya 0, tidak ada perubahan
    return { value: '0.0%', isPositive: null };
  }

  // Perhitungan normal
  const change = ((currentNum - previousNum) / previousNum) * 100;
  const isPositive = change >= 0;
  
  return { value: `${Math.abs(change).toFixed(1)}%`, isPositive };
};

function Card({ title, currentValue, previousValue, formatFn = (val) => val }) {
  const change = calculateChange(currentValue, previousValue);

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.currentValue}>{formatFn(currentValue)}</p>
      <div className={styles.comparison}>
        <span className={change.isPositive === true ? styles.positive : change.isPositive === false ? styles.negative : ''}>
          {/* Tampilkan panah hanya jika ada perubahan positif/negatif */}
          {change.isPositive === true ? '▲' : change.isPositive === false ? '▼' : ''} {change.value}
        </span>
        <span className={styles.period}>vs periode sebelumnya</span>
      </div>
    </div>
  );
}

export default Card;