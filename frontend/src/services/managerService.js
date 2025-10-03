import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { differenceInDays, subDays, format } from 'date-fns';
import { fetchDataFromCollection } from './utils';

export const getDashboardDataForPeriod = async (startDate, endDate) => {
  const advSnapshot = await getDocs(collection(db, "advertisers"));
  const advertisers = advSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const csSnapshot = await getDocs(collection(db, "customerServices"));
  const customerServices = csSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const masterData = { advertisers, customerServices };

  const currentPeriodData = await processManagerData(startDate, endDate, masterData);
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
  const adSpends = await fetchDataFromCollection('adSpends', startDate, endDate);
  const leads = await fetchDataFromCollection('leads', startDate, endDate);
  const sales = await fetchDataFromCollection('sales', startDate, endDate);

  const advertiserStats = {};
  advertisers.forEach(adv => {
      advertiserStats[adv.id] = { name: adv.name, grossOmset: 0, budgetAds: 0, closing: 0, quantity: 0, leads: 0 };
  });
  adSpends.forEach(spend => {
      if (advertiserStats[spend.advertiserId]) advertiserStats[spend.advertiserId].budgetAds += spend.spend;
  });
  leads.forEach(lead => {
      if (advertiserStats[lead.sourceAdvertiserId]) advertiserStats[lead.sourceAdvertiserId].leads += lead.leadCount;
  });
  sales.forEach(sale => {
      if (advertiserStats[sale.advertiserId]) {
          advertiserStats[sale.advertiserId].grossOmset += sale.omset;
          advertiserStats[sale.advertiserId].quantity += sale.quantity;
          advertiserStats[sale.advertiserId].closing += 1;
      }
  });
  const advertiserPerformance = Object.entries(advertiserStats).map(([id, stats]) => {
    const roas = stats.budgetAds > 0 ? (stats.grossOmset / stats.budgetAds).toFixed(2) : 0;
    const cac = stats.grossOmset > 0 ? ((stats.budgetAds / stats.grossOmset) * 100).toFixed(2) + '%' : '0.00%';
    const avgProducts = stats.closing > 0 ? (stats.quantity / stats.closing).toFixed(2) : 0;
    return { id, ...stats, roas, cac, avgProducts };
  });

  const csStats = {};
  customerServices.forEach(cs => {
      csStats[cs.id] = { name: cs.name, omset: 0, leads: 0, closing: 0, quantity: 0 };
  });
  leads.forEach(lead => {
      if (csStats[lead.csId]) csStats[lead.csId].leads += lead.leadCount;
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

  const summary = advertiserPerformance.reduce((acc, curr) => {
    acc.grossOmset += curr.grossOmset;
    acc.budgetAds += curr.budgetAds;
    acc.totalClosing += curr.closing;
    return acc;
  }, { grossOmset: 0, budgetAds: 0, totalClosing: 0 });
  summary.roas = summary.budgetAds > 0 ? (summary.grossOmset / summary.budgetAds).toFixed(2) : 0;
  
  const dailyTotals = {};
  const allTransactions = [...adSpends, ...leads, ...sales];
  allTransactions.forEach(item => {
      const dateKey = format(item.date, 'yyyy-MM-dd');
      if (!dailyTotals[dateKey]) {
          dailyTotals[dateKey] = { date: item.date, spend: 0, leads: 0, omset: 0, closing: 0 };
      }
      dailyTotals[dateKey].spend += item.spend || 0;
      dailyTotals[dateKey].leads += item.leadCount || 0;
      dailyTotals[dateKey].omset += item.omset || 0;
      if (item.quantity) dailyTotals[dateKey].closing += 1;
  });
  const dailyHistory = Object.values(dailyTotals);

  const timeSeriesData = {
    labels: [],
    datasets: [
        { label: 'Omset Harian', data: [], borderColor: 'rgb(255, 127, 80)', yAxisID: 'y' },
        { label: 'Budget Harian', data: [], borderColor: 'rgb(75, 85, 99)', yAxisID: 'y1' }
    ]
  };
  const sortedDates = Object.keys(dailyTotals).sort((a,b) => new Date(a) - new Date(b));
  sortedDates.forEach(date => {
      timeSeriesData.labels.push(format(new Date(date), 'dd MMM'));
      timeSeriesData.datasets[0].data.push(dailyTotals[date].omset);
      timeSeriesData.datasets[1].data.push(dailyTotals[date].spend);
  });
  
  return { summary, advertiserPerformance, csPerformance, dailyHistory, chartData: timeSeriesData };
}

function createEmptyData() {
    return {
        summary: { grossOmset: 0, budgetAds: 0, totalClosing: 0, roas: 0 },
        advertiserPerformance: [],
        csPerformance: [],
        dailyHistory: [],
        chartData: { labels: [], datasets: [{ data: [] }, { data: [] }] },
    };
}