import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import CSForm from '../../components/specific/CSForm/CSForm';
import styles from './ManageCSPage.module.css';

function ManageCSPage() {
  const { customerServices, addCS, updateCS, deleteCS, loading } = useData();
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
      updateCS(editingCS.id, formData);
    } else {
      addCS(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this CS? This action cannot be undone.")) {
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
        {loading ? <p>Memuat data...</p> : (
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
                    <td>
                      <div className={styles.userCell}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${cs.name.replace(/\s/g, '+')}&background=random`} 
                          alt={cs.name} 
                          className={styles.avatar} 
                        />
                        <div>
                          <div className={styles.userName}>{cs.name}</div>
                          <div className={styles.userEmail}>{cs.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.actions}>
                      <button onClick={() => handleOpenModal(cs)} className={styles.editButton}>Edit</button>
                      <button onClick={() => handleDelete(cs.id)} className={styles.deleteButton}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2" style={{ textAlign: 'center' }}>Belum ada data CS.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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