import React, { useState, useEffect } from 'react';
import styles from './AdvertiserForm.module.css';

function AdvertiserForm({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name || '', email: initialData.email || '' });
    } else {
      setFormData({ name: '', email: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{initialData ? 'Edit Advertiser' : 'Tambah Advertiser'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nama Advertiser</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className={styles.input} />
          </div>
          {/* --- INPUT EMAIL BARU --- */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={styles.input} />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Batal</button>
            <button type="submit" className={styles.submitButton}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdvertiserForm;