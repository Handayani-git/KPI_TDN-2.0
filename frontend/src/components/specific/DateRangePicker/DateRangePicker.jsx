import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { id } from 'date-fns/locale'; // Pastikan locale tetap diimpor

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import styles from './DateRangePicker.module.css';

function DateRangePickerComponent({ onDateChange }) {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi handleSelect tidak perlu diubah
  const handleSelect = (ranges) => {
    const { selection } = ranges;
    setState([selection]);
  };
  
  // Fungsi applyDateChange tidak perlu diubah
  const applyDateChange = () => {
    onDateChange(state[0]);
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return ''; // Handle jika tanggal null
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
  }

  return (
    <div className={styles.container}>
      <button className={styles.dateButton} onClick={() => setIsOpen(!isOpen)}>
        {state[0].startDate ? `${formatDate(state[0].startDate)} - ${formatDate(state[0].endDate)}` : 'Pilih Tanggal'}
      </button>
      {isOpen && (
        <div className={styles.pickerWrapper}>
          <DateRange
            locale={id}
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={state}
          />
          <button className={styles.closeButton} onClick={applyDateChange}>
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}

export default DateRangePickerComponent;