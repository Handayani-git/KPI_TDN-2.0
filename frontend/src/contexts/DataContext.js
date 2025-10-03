import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [advertisers, setAdvertisers] = useState([]);
  const [customerServices, setCustomerServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const advSnapshot = await getDocs(collection(db, "advertisers"));
      setAdvertisers(advSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const csSnapshot = await getDocs(collection(db, "customerServices"));
      setCustomerServices(csSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Failed to load master data:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  // --- ADVERTISER CRUD FUNCTIONS ---
  const addAdvertiser = async (data) => {
    await addDoc(collection(db, "advertisers"), data);
    await fetchData();
  };
  const updateAdvertiser = async (id, data) => {
    await updateDoc(doc(db, "advertisers", id), data);
    await fetchData();
  };
  const deleteAdvertiser = async (id) => {
    await deleteDoc(doc(db, "advertisers", id));
    await fetchData();
  };

  // --- CS CRUD FUNCTIONS ---
  const addCS = async (data) => {
    await addDoc(collection(db, "customerServices"), data);
    await fetchData();
  };
  const updateCS = async (id, data) => {
    await updateDoc(doc(db, "customerServices", id), data);
    await fetchData();
  };
  const deleteCS = async (id) => {
    await deleteDoc(doc(db, "customerServices", id));
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