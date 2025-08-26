import kpiData from '../data/dummy-kpi-data.json';
import { differenceInDays, subDays, startOfDay, endOfDay, format } from 'date-fns';

//======================================================================
//== FUNGSI UTAMA (EXPORTED)
//======================================================================

export const getDashboardDataForPeriod = (startDate, endDate) => {
  const currentPeriodData = processDataForDateRange(startDate, endDate);

  let previousPeriodData = createEmptyData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = processDataForDateRange(previousPeriodStartDate, previousPeriodEndDate);
  }

  return { current: currentPeriodData, previous: previousPeriodData };
};

export const getCSDashboardDataForPeriod = (csId, startDate, endDate) => {
  const currentPeriodData = processCSDataForDateRange(csId, startDate, endDate);

  let previousPeriodData = createEmptyCSData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = processCSDataForDateRange(csId, previousPeriodStartDate, previousPeriodEndDate);
  }

  return { current: currentPeriodData, previous: previousPeriodData };
};


//======================================================================
//== FUNGSI PEMROSESAN INTERNAL
//======================================================================

function processDataForDateRange(startDate, endDate) {
  const { dailyPerformance, advertisers, customerServices } = kpiData;

  const filteredDailyPerformance = (startDate && endDate)
    ? dailyPerformance.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startOfDay(startDate) && itemDate <= endOfDay(endDate);
      })
    : dailyPerformance;

  const detailedDailyPerformance = filteredDailyPerformance.map(item => {
    const advertiser = advertisers.find(a => a.id === item.advertiserId);
    const cs = customerServices.find(c => c.id === item.csId);
    return {
      ...item,
      advertiserName: advertiser ? advertiser.name : 'Unknown',
      csName: cs ? cs.name : 'Unknown',
    };
  });

  const advertiserStats = {};
  filteredDailyPerformance.forEach(item => {
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
  filteredDailyPerformance.forEach(item => {
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
  
  // Agregasi omset DAN spend per tanggal unik untuk grafik
  const dailyTotals = {};
  filteredDailyPerformance.forEach(item => {
    const dateKey = item.date;
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

function processCSDataForDateRange(csId, startDate, endDate) {
  const { dailyPerformance } = kpiData;

  const filteredByUser = dailyPerformance.filter(item => item.csId === csId);

  const filteredByDate = (startDate && endDate)
    ? filteredByUser.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startOfDay(startDate) && itemDate <= endOfDay(endDate);
      })
    : filteredByUser;

  const summary = filteredByDate.reduce((acc, curr) => {
    acc.omset += curr.omset;
    acc.leads += curr.leads;
    acc.closing += curr.closing;
    acc.quantity += curr.quantity;
    return acc;
  }, { omset: 0, leads: 0, closing: 0, quantity: 0 });

  summary.closingRate = summary.leads > 0 ? ((summary.closing / summary.leads) * 100).toFixed(1) + '%' : '0.0%';

  return { summary, dailyHistory: filteredByDate };
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