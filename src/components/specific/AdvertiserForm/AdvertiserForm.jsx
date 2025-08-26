import React, { useState, useEffect } from 'react';
import styles from './AdvertiserForm.module.css';

function AdvertiserForm({ isOpen, onClose, onSubmit, initialData }) {
  const [name, setName] = useState('');

  // useEffect untuk mengisi form saat mode "Edit"
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName(''); // Kosongkan form untuk mode "Tambah"
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name }); // Kirim data ke parent
    onClose(); // Tutup modal
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {initialData ? 'Edit Advertiser' : 'Tambah Advertiser Baru'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nama Advertiser</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Batal
            </button>
            <button type="submit" className={styles.submitButton}>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdvertiserForm;