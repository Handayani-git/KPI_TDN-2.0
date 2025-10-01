import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { differenceInDays, subDays, startOfDay, endOfDay, format } from 'date-fns';

//======================================================================
//== FUNGSI UTAMA (EXPORTED)
//======================================================================

/**
 * Mengambil dan memproses data lengkap untuk Dashboard Manager.
 */
export const getDashboardDataForPeriod = async (startDate, endDate) => {
  // Ambil data master (Advertiser & CS) dari Firestore terlebih dahulu
  const advSnapshot = await getDocs(collection(db, "advertisers"));
  const advertisers = advSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const csSnapshot = await getDocs(collection(db, "customerServices"));
  const customerServices = csSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const masterData = { advertisers, customerServices };

  const currentPeriodData = await processDataForDateRange(startDate, endDate, masterData);

  let previousPeriodData = createEmptyData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processDataForDateRange(previousPeriodStartDate, previousPeriodEndDate, masterData);
  }

  return { current: currentPeriodData, previous: previousPeriodData };
};

/**
 * Mengambil dan memproses data spesifik untuk Dashboard CS.
 */
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


//======================================================================
//== FUNGSI PEMROSESAN INTERNAL
//======================================================================

/**
 * Helper internal untuk memproses data dashboard manager.
 */
async function processDataForDateRange(startDate, endDate, masterData) {
  const { advertisers, customerServices } = masterData;
  const performanceRef = collection(db, "dailyPerformance");
  let dailyPerformance = [];

  // 1. Buat query ke Firestore berdasarkan tanggal
  if (startDate && endDate) {
    const q = query(performanceRef, 
      where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
      where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));
  } else {
    // Jika tidak ada tanggal (mode "Semua Waktu"), ambil semua data
    const querySnapshot = await getDocs(performanceRef);
    querySnapshot.forEach(doc => dailyPerformance.push({ ...doc.data(), date: doc.data().date.toDate() }));
  }

  // 2. Setelah data didapat dari Firestore, sisa LOGIKA AGREGASI TETAP SAMA
  const detailedDailyPerformance = dailyPerformance.map(item => ({
    ...item,
    advertiserName: advertisers.find(a => a.id === item.advertiserId)?.name || 'Unknown',
    csName: customerServices.find(c => c.id === item.csId)?.name || 'Unknown',
  }));
  
  // Agregasi Performa Advertiser
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

  // Agregasi Performa CS
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
  
  // Hitung Ringkasan Total (Summary)
  const summary = advertiserPerformance.reduce((acc, curr) => {
    acc.grossOmset += curr.grossOmset;
    acc.budgetAds += curr.budgetAds;
    acc.totalClosing += curr.closing;
    return acc;
  }, { grossOmset: 0, budgetAds: 0, totalClosing: 0 });
  summary.roas = summary.budgetAds > 0 ? (summary.grossOmset / summary.budgetAds).toFixed(2) : 0;
  
  // Agregasi omset DAN spend per tanggal unik untuk grafik
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
      {
        label: 'Omset Harian',
        data: [],
        borderColor: 'rgb(255, 127, 80)',
        backgroundColor: 'rgba(255, 127, 80, 0.5)',
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: 'Budget Harian',
        data: [],
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.5)',
        yAxisID: 'y1',
        tension: 0.1
      }
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

/**
 * Helper internal untuk memproses data dashboard CS.
 */
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

//======================================================================
//== FUNGSI HELPER UNTUK DATA KOSONG
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

function createEmptyAdvData() {
    return {
      summary: { omset: 0, spend: 0, leads: 0, closing: 0, roas: 0 },
      dailyHistory: []
    };
}