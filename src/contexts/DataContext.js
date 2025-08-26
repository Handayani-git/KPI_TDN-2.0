import React, { createContext, useState, useContext } from 'react';
import kpiData from '../data/dummy-kpi-data.json';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [advertisers, setAdvertisers] = useState(kpiData.advertisers);
  const [customerServices, setCustomerServices] = useState(kpiData.customerServices);
  const [dailyPerformance, setDailyPerformance] = useState(kpiData.dailyPerformance);

  // Fungsi untuk MENAMBAH advertiser baru
  const addAdvertiser = (name) => {
    const newAdvertiser = {
      id: `adv${Date.now()}`,
      name: name,
    };
    setAdvertisers(prev => [...prev, newAdvertiser]);
  };

  // Fungsi untuk MENGUBAH advertiser
  const updateAdvertiser = (id, updatedName) => {
    setAdvertisers(prev => 
      prev.map(adv => 
        adv.id === id ? { ...adv, name: updatedName } : adv
      )
    );
  };

  // Fungsi untuk MENGHAPUS advertiser
  const deleteAdvertiser = (id) => {
    setAdvertisers(prev => prev.filter(adv => adv.id !== id));
  };
  
  // Fungsi untuk MENAMBAH data harian baru
  const addDailyReport = (newReport) => {
    setDailyPerformance(prev => [...prev, newReport]);
  };

  const value = {
    advertisers,
    addAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
    customerServices,
    dailyPerformance, 
    addDailyReport, 
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}