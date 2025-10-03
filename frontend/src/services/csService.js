import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { differenceInDays, subDays, startOfDay, endOfDay, format } from 'date-fns';
import { fetchDataFromCollection } from './utils'; // Menggunakan helper dari utils.js

//======================================================================
//== FUNGSI UTAMA (EXPORTED)
//======================================================================
export const getCSDashboardDataForPeriod = async (csId, startDate, endDate) => {
  // Jika csId adalah 'all', kita kirim null agar tidak difilter per user
  const filterValue = csId === 'all' ? null : csId;
  
  const currentPeriodData = await processCSDataForDateRange(filterValue, startDate, endDate);

  let previousPeriodData = createEmptyCSData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processCSDataForDateRange(filterValue, previousPeriodStartDate, previousPeriodEndDate);
  }
  return { current: currentPeriodData, previous: previousPeriodData };
};

//======================================================================
//== FUNGSI PEMROSESAN INTERNAL
//======================================================================
async function processCSDataForDateRange(csId, startDate, endDate) {
    // Gunakan filter 'csId' jika nilainya ada, jika tidak, ambil semua
    const leadsData = await fetchDataFromCollection('leads', startDate, endDate, csId ? 'csId' : null, csId);
    const salesData = await fetchDataFromCollection('sales', startDate, endDate, csId ? 'csId' : null, csId);

    const summary = { omset: 0, leads: 0, closing: 0, quantity: 0 };

    leadsData.forEach(lead => {
        summary.leads += lead.leadCount;
    });

    salesData.forEach(sale => {
        summary.omset += sale.omset;
        summary.closing += 1;
        summary.quantity += sale.quantity;
    });

    summary.closingRate = summary.leads > 0 ? ((summary.closing / summary.leads) * 100).toFixed(1) + '%' : '0.0%';
    
    // Gabungkan dan agregasi data harian
    const dailyHistoryMap = {};
    [...leadsData, ...salesData].forEach(item => {
        const dateKey = format(item.date, 'yyyy-MM-dd');
        if (!dailyHistoryMap[dateKey]) {
            dailyHistoryMap[dateKey] = { date: item.date, omset: 0, leads: 0, closing: 0, quantity: 0 };
        }
        dailyHistoryMap[dateKey].omset += item.omset || 0;
        dailyHistoryMap[dateKey].leads += item.leadCount || 0;
        dailyHistoryMap[dateKey].quantity += item.quantity || 0;
        if(item.omset !== undefined) { // Hitung closing hanya dari data sales
            dailyHistoryMap[dateKey].closing += 1;
        }
    });

    return { summary, dailyHistory: Object.values(dailyHistoryMap).sort((a,b) => b.date - a.date) };
}

//======================================================================
//== FUNGSI HELPER UNTUK DATA KOSONG
//======================================================================
function createEmptyCSData() {
    return {
      summary: { omset: 0, leads: 0, closing: 0, quantity: 0, closingRate: '0.0%' },
      dailyHistory: []
    };
}