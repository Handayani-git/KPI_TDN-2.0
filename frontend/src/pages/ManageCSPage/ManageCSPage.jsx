import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import CSForm from '../../components/specific/CSForm/CSForm';
import styles from './ManageCSPage.module.css';

function ManageCSPage() {
  const { customerServices, addCS, updateCS, deleteCS, loading } = useData();

  // State untuk mengontrol form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCS, setEditingCS] = useState(null);

  const handleOpenModal = (cs = null) => {
    setEditingCS(cs);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCS(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingCS) {
      updateCS(editingCS.id, formData.name);
    } else {
      addCS(formData.name);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus CS ini? Aksi ini tidak bisa dibatalkan.")) {
      deleteCS(id);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.headerTitle}>Kelola Customer Service</h1>
        <button onClick={() => handleOpenModal()} className={styles.addButton}>
          Tambah CS Baru
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama CS</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customerServices.length > 0 ? (
                customerServices.map(cs => (
                  <tr key={cs.id}>
                    <td>{cs.name}</td>
                    <td className={styles.actions}>
                      <button onClick={() => handleOpenModal(cs)} className={styles.editButton}>Edit</button>
                      <button onClick={() => handleDelete(cs.id)} className={styles.deleteButton}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>Belum ada data CS.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Komponen Form Modal */}
      <CSForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingCS}
      />
    </div>
  );
}

export default ManageCSPage;