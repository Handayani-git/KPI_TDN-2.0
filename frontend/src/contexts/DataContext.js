import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [advertisers, setAdvertisers] = useState([]);
  const [customerServices, setCustomerServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memuat semua data master dari Firestore
  const fetchData = async () => {
    try {
      const advSnapshot = await getDocs(collection(db, "advertisers"));
      setAdvertisers(advSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const csSnapshot = await getDocs(collection(db, "customerServices"));
      setCustomerServices(csSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Gagal memuat data master:", error);
    }
  };

  // Memuat data pertama kali saat aplikasi dibuka
  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  // --- FUNGSI CRUD ADVERTISER DENGAN FIREBASE ---
  const addAdvertiser = async (name) => {
    await addDoc(collection(db, "advertisers"), { name });
    await fetchData(); // Muat ulang data setelah menambah
  };

  const updateAdvertiser = async (id, updatedName) => {
    const advDoc = doc(db, "advertisers", id);
    await updateDoc(advDoc, { name: updatedName });
    await fetchData();
  };

  const deleteAdvertiser = async (id) => {
    const advDoc = doc(db, "advertisers", id);
    await deleteDoc(advDoc);
    await fetchData();
  };

  // --- FUNGSI CRUD CS DENGAN FIREBASE ---
  const addCS = async (name) => {
    await addDoc(collection(db, "customerServices"), { name });
    await fetchData();
  };

  const updateCS = async (id, updatedName) => {
    const csDoc = doc(db, "customerServices", id);
    await updateDoc(csDoc, { name: updatedName });
    await fetchData();
  };

  const deleteCS = async (id) => {
    const csDoc = doc(db, "customerServices", id);
    await deleteDoc(csDoc);
    await fetchData();
  };

  const value = {
    advertisers,
    customerServices,
    loading,
    addAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
    addCS,
    updateCS,
    deleteCS,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}