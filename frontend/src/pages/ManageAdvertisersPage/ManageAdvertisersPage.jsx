import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import AdvertiserForm from '../../components/specific/AdvertiserForm/AdvertiserForm';
import styles from './ManageAdvertisersPage.module.css';

function ManageAdvertisersPage() {
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser, loading } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);

  const handleOpenModal = (advertiser = null) => {
    setEditingAdvertiser(advertiser);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdvertiser(null);
  };

  // --- FUNGSI DIPERBARUI UNTUK MENGIRIM SEMUA DATA ---
  const handleFormSubmit = (formData) => {
    if (editingAdvertiser) {
      // Kirim seluruh objek formData (termasuk name dan email)
      updateAdvertiser(editingAdvertiser.id, formData);
    } else {
      // Kirim seluruh objek formData
      addAdvertiser(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus advertiser ini? Aksi ini tidak bisa dibatalkan.")) {
      deleteAdvertiser(id);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Kelola Advertiser</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          Tambah Advertiser Baru
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {/* --- HEADER TABEL DIPERBARUI --- */}
                <th>Nama Advertiser</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.length > 0 ? (
                advertisers.map(adv => (
                  <tr key={adv.id}>
                    {/* --- TAMPILAN SEL DIPERBARUI DENGAN FOTO & EMAIL --- */}
                    <td>
                      <div className={styles.userCell}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${adv.name.replace(/\s/g, '+')}&background=random`} 
                          alt={adv.name} 
                          className={styles.avatar} 
                        />
                        <div>
                          <div className={styles.userName}>{adv.name}</div>
                          <div className={styles.userEmail}>{adv.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.actions}>
                      <button onClick={() => handleOpenModal(adv)} className={styles.editButton}>Edit</button>
                      <button onClick={() => handleDelete(adv.id)} className={styles.deleteButton}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>Belum ada data advertiser.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AdvertiserForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingAdvertiser}
      />
    </div>
  );
}

export default ManageAdvertisersPage;