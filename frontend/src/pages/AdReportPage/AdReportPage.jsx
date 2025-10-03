// pages/AdReportPage/AdReportPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase'; // Pastikan path ini benar
import { collection, doc, runTransaction, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { startOfDay } from 'date-fns';

// UI Components (sesuaikan dengan punya Anda)
import styles from './AdReportPage.module.css'; 

function AdReportPage() {
    const { user } = useAuth();
    
    // State untuk form
    const [reportDate, setReportDate] = useState(new Date());
    const [spend, setSpend] = useState('');
    const [leads, setLeads] = useState('');
    const [selectedCs, setSelectedCs] = useState('');
    
    // State untuk UI
    const [csList, setCsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mengambil daftar CS untuk dropdown saat komponen dimuat
    useEffect(() => {
        const fetchCsUsers = async () => {
            const q = query(collection(db, "users"), where("role", "==", "cs"));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCsList(list);
            if (list.length > 0) {
                setSelectedCs(list[0].id); // Set default value
            }
        };
        fetchCsUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!spend || !leads || !selectedCs) {
            setError('Semua field wajib diisi.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Firestore Transaction untuk update data agregat secara aman
            await runTransaction(db, async (transaction) => {
                // 1. Buat ID dokumen kustom berdasarkan tanggal, adv, dan cs
                const date = startOfDay(reportDate);
                const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
                const docId = `${dateString}_${user.id}_${selectedCs}`;
                const performanceDocRef = doc(db, "dailyPerformance", docId);

                // 2. Baca dokumen yang ada di dalam transaksi
                const performanceDoc = await transaction.get(performanceDocRef);

                const spendAmount = Number(spend);
                const leadsCount = Number(leads);

                if (!performanceDoc.exists()) {
                    // 3. Jika dokumen BELUM ADA, buat baru (set)
                    transaction.set(performanceDocRef, {
                        date: Timestamp.fromDate(date),
                        advertiserId: user.id,
                        csId: selectedCs,
                        spend: spendAmount,
                        leads: leadsCount,
                        omset: 0,
                        closing: 0,
                        quantity: 0
                    });
                } else {
                    // 4. Jika dokumen SUDAH ADA, perbarui (update)
                    const currentData = performanceDoc.data();
                    transaction.update(performanceDocRef, {
                        spend: currentData.spend + spendAmount,
                        leads: currentData.leads + leadsCount
                    });
                }
            });

            setSuccess('Laporan berhasil disimpan!');
            // Reset form
            setSpend('');
            setLeads('');

        } catch (err) {
            console.error("Gagal menyimpan laporan:", err);
            setError("Terjadi kesalahan. Gagal menyimpan laporan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Lapor Kinerja Iklan</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="date">Tanggal Laporan</label>
                    <input 
                        type="date" 
                        id="date"
                        value={reportDate.toISOString().split('T')[0]}
                        onChange={(e) => setReportDate(new Date(e.target.value))}
                        required 
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="spend">Total Budget Spend (Rp)</label>
                    <input 
                        type="number" 
                        id="spend"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                        placeholder="Contoh: 500000" 
                        required 
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="leads">Jumlah Leads</label>
                    <input 
                        type="number" 
                        id="leads"
                        value={leads}
                        onChange={(e) => setLeads(e.target.value)}
                        placeholder="Contoh: 15" 
                        required 
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="cs">CS Terkait</label>
                    <select id="cs" value={selectedCs} onChange={(e) => setSelectedCs(e.target.value)} required>
                        {csList.map(cs => (
                            <option key={cs.id} value={cs.id}>{cs.name}</option>
                        ))}
                    </select>
                </div>
                
                <button type="submit" disabled={isLoading} className={styles.submitButton}>
                    {isLoading ? 'Menyimpan...' : 'Simpan Laporan'}
                </button>

                {success && <p className={styles.successMessage}>{success}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
            </form>
        </div>
    );
}

export default AdReportPage;