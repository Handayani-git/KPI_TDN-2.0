import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext'; // <-- Menggunakan useData untuk akses data dan fungsi
import AdvertiserForm from '../../components/specific/AdvertiserForm/AdvertiserForm'; // <-- Menggunakan form modal
import styles from './ManageAdvertisersPage.module.css';

function ManageAdvertisersPage() {
  // Ambil data dan fungsi CRUD dari DataContext yang terhubung ke Firebase
  const { advertisers, addAdvertiser, updateAdvertiser, deleteAdvertiser, loading } = useData();

  // State untuk mengontrol form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);

  // Fungsi untuk membuka form (baik untuk menambah baru atau mengedit)
  const handleOpenModal = (advertiser = null) => {
    setEditingAdvertiser(advertiser); // Jika 'advertiser' null, berarti mode "Tambah Baru"
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdvertiser(null);
  };

  // Fungsi yang dijalankan saat form di-submit
  const handleFormSubmit = (formData) => {
    if (editingAdvertiser) {
      // Jika ada data advertiser yang diedit, jalankan fungsi update
      updateAdvertiser(editingAdvertiser.id, formData.name);
    } else {
      // Jika tidak, jalankan fungsi tambah baru
      addAdvertiser(formData.name);
    }
  };

  // Fungsi untuk menghapus advertiser
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
                <th>Nama Advertiser</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.length > 0 ? (
                advertisers.map(adv => (
                  <tr key={adv.id}>
                    <td>{adv.name}</td>
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

      {/* Komponen Form Modal */}
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