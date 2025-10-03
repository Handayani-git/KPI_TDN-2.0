import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { differenceInDays, subDays, startOfDay, endOfDay, format } from 'date-fns';

//======================================================================
//== FUNGSI HELPER UTAMA
//======================================================================
function createEmptyData() {
    return {
        summary: { grossOmset: 0, budgetAds: 0, totalClosing: 0, roas: 0 },
        advertiserPerformance: [],
        csPerformance: [],
        dailyHistory: [],
        chartData: { labels: [], datasets: [{ data: [] }, { data: [] }] },
    };

    
}


function createEmptyCSData() {
    return {
      summary: { omset: 0, leads: 0, closing: 0, quantity: 0, closingRate: '0.0%' },
      dailyHistory: []
    };
}

function createEmptyAdvData() {
    return {
      summary: { omset: 0, spend: 0, leads: 0, closing: 0, roas: 0 },
      dailyHistory: []
    };
}

async function processDataForDateRange(startDate, endDate, masterData) {
  const { advertisers, customerServices } = masterData;
  const performanceRef = collection(db, "dailyPerformance");
  let dailyPerformance = [];

  if (startDate && endDate) {
    const q = query(performanceRef, 
      where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
      where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));
  } else {
    const querySnapshot = await getDocs(performanceRef);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));
  }

  const detailedDailyPerformance = dailyPerformance.map(item => ({
    ...item,
    advertiserName: advertisers.find(a => a.id === item.advertiserId)?.name || 'Unknown',
    csName: customerServices.find(c => c.id === item.csId)?.name || 'Unknown',
  }));
  
  const advertiserStats = {};
  dailyPerformance.forEach(item => {
    if (!advertiserStats[item.advertiserId]) {
      advertiserStats[item.advertiserId] = { spend: 0, omset: 0, closing: 0, quantity: 0 };
    }
    advertiserStats[item.advertiserId].spend += item.spend;
    advertiserStats[item.advertiserId].omset += item.omset;
    advertiserStats[item.advertiserId].closing += item.closing;
    advertiserStats[item.advertiserId].quantity += item.quantity;
  });
  const advertiserPerformance = Object.keys(advertiserStats).map(advId => {
    const stats = advertiserStats[advId];
    const advertiserInfo = advertisers.find(adv => adv.id === advId);
    const roas = stats.spend > 0 ? (stats.omset / stats.spend).toFixed(2) : 0;
    const cac = stats.omset > 0 ? ((stats.spend / stats.omset) * 100).toFixed(2) + '%' : '0.00%';
    const avgProducts = stats.closing > 0 ? (stats.quantity / stats.closing).toFixed(2) : 0;
    return { 
      id: advId, name: advertiserInfo?.name || 'Unknown', grossOmset: stats.omset, 
      budgetAds: stats.spend, roas, cac, closing: stats.closing, quantity: stats.quantity,
      avgProducts: avgProducts,
    };
  });

  const csStats = {};
  dailyPerformance.forEach(item => {
    if (!csStats[item.csId]) {
      csStats[item.csId] = { omset: 0, leads: 0, closing: 0, quantity: 0 };
    }
    csStats[item.csId].omset += item.omset;
    csStats[item.csId].leads += item.leads;
    csStats[item.csId].closing += item.closing;
    csStats[item.csId].quantity += item.quantity;
  });
  const csPerformance = Object.keys(csStats).map(csId => {
    const stats = csStats[csId];
    const csInfo = customerServices.find(cs => cs.id === csId);
    const closingRate = stats.leads > 0 ? ((stats.closing / stats.leads) * 100).toFixed(0) + '%' : '0%';
    const avgProducts = stats.closing > 0 ? (stats.quantity / stats.closing).toFixed(2) : 0;
    return { 
      id: csId, name: csInfo?.name || 'Unknown', omset: stats.omset, 
      leads: stats.leads, closing: stats.closing, quantity: stats.quantity, 
      closingRate, avgProducts: avgProducts,
    };
  });
  
  const summary = advertiserPerformance.reduce((acc, curr) => {
    acc.grossOmset += curr.grossOmset;
    acc.budgetAds += curr.budgetAds;
    acc.totalClosing += curr.closing;
    return acc;
  }, { grossOmset: 0, budgetAds: 0, totalClosing: 0 });
  summary.roas = summary.budgetAds > 0 ? (summary.grossOmset / summary.budgetAds).toFixed(2) : 0;
  
  const dailyTotals = {};
  dailyPerformance.forEach(item => {
    const dateKey = format(item.date, 'yyyy-MM-dd');
    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { omset: 0, spend: 0 };
    }
    dailyTotals[dateKey].omset += item.omset;
    dailyTotals[dateKey].spend += item.spend;
  });
  const timeSeriesData = {
    labels: [],
    datasets: [
      { label: 'Omset Harian', data: [], borderColor: 'rgb(255, 127, 80)', backgroundColor: 'rgba(255, 127, 80, 0.5)', yAxisID: 'y', tension: 0.1 },
      { label: 'Budget Harian', data: [], borderColor: 'rgb(75, 85, 99)', backgroundColor: 'rgba(75, 85, 99, 0.5)', yAxisID: 'y1', tension: 0.1 }
    ]
  };
  const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));
  sortedDates.forEach(date => {
    const dateLabel = format(new Date(date), 'dd MMM');
    timeSeriesData.labels.push(dateLabel);
    timeSeriesData.datasets[0].data.push(dailyTotals[date].omset);
    timeSeriesData.datasets[1].data.push(dailyTotals[date].spend);
  });
  
  return { 
    summary, 
    advertiserPerformance, 
    csPerformance,
    dailyHistory: detailedDailyPerformance,
    chartData: timeSeriesData, 
  };
}

async function processCSDataForDateRange(csId, startDate, endDate) {
    const performanceRef = collection(db, "dailyPerformance");
    let dailyPerformance = [];
    let q = query(performanceRef, where("csId", "==", csId));

    if (startDate && endDate) {
        q = query(q, 
            where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
            where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
        );
    }
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));

    const summary = dailyPerformance.reduce((acc, curr) => {
        acc.omset += curr.omset;
        acc.leads += curr.leads;
        acc.closing += curr.closing;
        acc.quantity += curr.quantity;
        return acc;
    }, { omset: 0, leads: 0, closing: 0, quantity: 0 });
    summary.closingRate = summary.leads > 0 ? ((summary.closing / summary.leads) * 100).toFixed(1) + '%' : '0.0%';

    return { summary, dailyHistory: dailyPerformance };
}

async function processAdvDataForDateRange(advId, startDate, endDate) {
    const performanceRef = collection(db, "dailyPerformance");
    let dailyPerformance = [];
    let q = query(performanceRef, where("advertiserId", "==", advId));

    if (startDate && endDate) {
        q = query(q, 
            where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
            where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
        );
    }
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));

    const summary = dailyPerformance.reduce((acc, curr) => {
        acc.omset += curr.omset;
        acc.spend += curr.spend;
        acc.leads += curr.leads;
        acc.closing += curr.closing;
        return acc;
    }, { omset: 0, spend: 0, leads: 0, closing: 0 });
    summary.roas = summary.spend > 0 ? (summary.omset / summary.spend).toFixed(2) : 0;

    return { summary, dailyHistory: dailyPerformance };
}

// Fungsi generik untuk mengambil data dari koleksi berdasarkan rentang tanggal
const fetchDataFromCollection = async (collectionName, startDate, endDate) => {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef);

    if (startDate && endDate) {
        q = query(collectionRef,
            where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
            where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
        );
    }

    const querySnapshot = await getDocs(q);
    // Ubah data Firestore menjadi array JavaScript, dan konversi Timestamp ke Date object
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().date.toDate() }));
};

//======================================================================
//== FUNGSI UNTUK DASHBOARD MANAGER
//======================================================================

export const getDashboardDataForPeriod = async (startDate, endDate) => {
  // 1. Ambil semua data master
  const advSnapshot = await getDocs(collection(db, "advertisers"));
  const advertisers = advSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const csSnapshot = await getDocs(collection(db, "customerServices"));
  const customerServices = csSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const masterData = { advertisers, customerServices };

  // 2. Proses data untuk periode saat ini
  const currentPeriodData = await processManagerData(startDate, endDate, masterData);

  // 3. Proses data untuk periode perbandingan
  let previousPeriodData = createEmptyData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processManagerData(previousPeriodStartDate, previousPeriodEndDate, masterData);
  }

  return { current: currentPeriodData, previous: previousPeriodData };
};

async function processManagerData(startDate, endDate, masterData) {
  const { advertisers, customerServices } = masterData;
  
  // Ambil semua data transaksi dari 3 koleksi berbeda
  const adSpends = await fetchDataFromCollection('adSpends', startDate, endDate);
  const leads = await fetchDataFromCollection('leads', startDate, endDate);
  const sales = await fetchDataFromCollection('sales', startDate, endDate);

  // --- AGREGASI KINERJA ADVERTISER ---
  const advertiserStats = {};
  advertisers.forEach(adv => {
      advertiserStats[adv.id] = { name: adv.name, grossOmset: 0, budgetAds: 0, closing: 0, quantity: 0, leads: 0 };
  });

  adSpends.forEach(spend => {
      if (advertiserStats[spend.advertiserId]) {
          advertiserStats[spend.advertiserId].budgetAds += spend.spend;
      }
  });

  leads.forEach(lead => {
      // Asumsi sourceAdvertiserId adalah ID dari koleksi advertisers
      if (advertiserStats[lead.sourceAdvertiserId]) {
          advertiserStats[lead.sourceAdvertiserId].leads += lead.leadCount;
      }
  });

  sales.forEach(sale => {
      if (advertiserStats[sale.advertiserId]) {
          advertiserStats[sale.advertiserId].grossOmset += sale.omset;
          advertiserStats[sale.advertiserId].quantity += sale.quantity;
          advertiserStats[sale.advertiserId].closing += 1; // Setiap dokumen penjualan dihitung 1 closing
      }
  });

  const advertiserPerformance = Object.entries(advertiserStats).map(([id, stats]) => {
    const roas = stats.budgetAds > 0 ? (stats.grossOmset / stats.budgetAds).toFixed(2) : 0;
    const cac = stats.grossOmset > 0 ? ((stats.budgetAds / stats.grossOmset) * 100).toFixed(2) + '%' : '0.00%';
    const avgProducts = stats.closing > 0 ? (stats.quantity / stats.closing).toFixed(2) : 0;
    return { id, ...stats, roas, cac, avgProducts };
  });

  // --- AGREGASI KINERJA CS ---
  const csStats = {};
  customerServices.forEach(cs => {
      csStats[cs.id] = { name: cs.name, omset: 0, leads: 0, closing: 0, quantity: 0 };
  });

  leads.forEach(lead => {
      if (csStats[lead.csId]) {
          csStats[lead.csId].leads += lead.leadCount;
      }
  });

  sales.forEach(sale => {
      if (csStats[sale.csId]) {
          csStats[sale.csId].omset += sale.omset;
          csStats[sale.csId].quantity += sale.quantity;
          csStats[sale.csId].closing += 1;
      }
  });
  
  const csPerformance = Object.entries(csStats).map(([id, stats]) => {
      const closingRate = stats.leads > 0 ? ((stats.closing / stats.leads) * 100).toFixed(0) + '%' : '0%';
      const avgProducts = stats.closing > 0 ? (stats.quantity / stats.closing).toFixed(2) : 0;
      return { id, ...stats, closingRate, avgProducts };
  });

  // --- RINGKASAN TOTAL (SUMMARY) ---
  const summary = advertiserPerformance.reduce((acc, curr) => {
    acc.grossOmset += curr.grossOmset;
    acc.budgetAds += curr.budgetAds;
    acc.totalClosing += curr.closing;
    return acc;
  }, { grossOmset: 0, budgetAds: 0, totalClosing: 0 });
  summary.roas = summary.budgetAds > 0 ? (summary.grossOmset / summary.budgetAds).toFixed(2) : 0;
  
  // --- PERSIAPAN DATA UNTUK GRAFIK & RINCIAN HARIAN ---
  const dailyTotals = {};

  const allTransactions = [...adSpends, ...leads, ...sales];
  allTransactions.forEach(item => {
      const dateKey = format(item.date, 'yyyy-MM-dd');
      if (!dailyTotals[dateKey]) {
          dailyTotals[dateKey] = { date: item.date, spend: 0, leads: 0, omset: 0, closing: 0, quantity: 0, advertiserName: '', csName: '' };
      }
      dailyTotals[dateKey].spend += item.spend || 0;
      dailyTotals[dateKey].leads += item.leadCount || 0;
      dailyTotals[dateKey].omset += item.omset || 0;
      dailyTotals[dateKey].quantity += item.quantity || 0;
      if (item.quantity) dailyTotals[dateKey].closing += 1; // Jika ada quantity, hitung closing
  });

  const dailyHistory = Object.values(dailyTotals).map(day => {
      const adv = advertisers.find(a => a.id === adSpends.find(s => format(s.date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'))?.advertiserId);
      const cs = customerServices.find(c => c.id === sales.find(s => format(s.date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'))?.csId);
      return { ...day, advertiserName: adv?.name || '-', csName: cs?.name || '-'};
  });

  const timeSeriesData = {
    labels: [],
    datasets: [
        { label: 'Omset Harian', data: [], borderColor: 'rgb(255, 127, 80)', backgroundColor: 'rgba(255, 127, 80, 0.5)', yAxisID: 'y' },
        { label: 'Budget Harian', data: [], borderColor: 'rgb(75, 85, 99)', backgroundColor: 'rgba(75, 85, 99, 0.5)', yAxisID: 'y1' }
    ]
  };

  const sortedDates = Object.keys(dailyTotals).sort((a,b) => new Date(a) - new Date(b));
  sortedDates.forEach(date => {
      timeSeriesData.labels.push(format(new Date(date), 'dd MMM'));
      timeSeriesData.datasets[0].data.push(dailyTotals[date].omset);
      timeSeriesData.datasets[1].data.push(dailyTotals[date].spend);
  });
  
  return { 
    summary, 
    advertiserPerformance, 
    csPerformance,
    dailyHistory,
    chartData: timeSeriesData, 
  };
}

// (Fungsi untuk dashboard CS dan ADV bisa ditambahkan/disesuaikan di sini)
export const getCSDashboardDataForPeriod = async (csId, startDate, endDate) => {
  const currentPeriodData = await processCSDataForDateRange(csId, startDate, endDate);
  let previousPeriodData = createEmptyCSData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processCSDataForDateRange(csId, previousPeriodStartDate, previousPeriodEndDate);
  }
  return { current: currentPeriodData, previous: previousPeriodData };
};

// --- FUNGSI UNTUK DASHBOARD ADV ---
export const getAdvertiserDashboardDataForPeriod = async (advId, startDate, endDate) => {
  const currentPeriodData = await processAdvDataForDateRange(advId, startDate, endDate);
  let previousPeriodData = createEmptyAdvData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processAdvDataForDateRange(advId, previousPeriodStartDate, previousPeriodEndDate);
  }
  return { current: currentPeriodData, previous: previousPeriodData };
};

//======================================================================
//== FUNGSI HELPER UNTUK DATA KOSONG
//======================================================================
