import { differenceInDays, subDays } from 'date-fns';
import { fetchDataFromCollection } from './utils';
import { format } from 'date-fns';

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

async function processCSDataForDateRange(csId, startDate, endDate) {
    const leadsData = await fetchDataFromCollection('leads', startDate, endDate, 'csId', csId);
    const salesData = await fetchDataFromCollection('sales', startDate, endDate, 'csId', csId);
    const summary = { omset: 0, leads: 0, closing: 0, quantity: 0 };

    leadsData.forEach(lead => summary.leads += lead.leadCount);
    salesData.forEach(sale => {
        summary.omset += sale.omset;
        summary.closing += 1;
        summary.quantity += sale.quantity;
    });
    summary.closingRate = summary.leads > 0 ? ((summary.closing / summary.leads) * 100).toFixed(1) + '%' : '0.0%';
    
    const dailyHistory = {};
    [...leadsData, ...salesData].forEach(item => {
        const dateKey = format(item.date, 'yyyy-MM-dd');
        if (!dailyHistory[dateKey]) dailyHistory[dateKey] = { date: item.date, omset: 0, leads: 0, closing: 0 };
        dailyHistory[dateKey].omset += item.omset || 0;
        dailyHistory[dateKey].leads += item.leadCount || 0;
        if(item.omset) dailyHistory[dateKey].closing += 1;
    });

    return { summary, dailyHistory: Object.values(dailyHistory) };
}

function createEmptyCSData() {
    return {
      summary: { omset: 0, leads: 0, closing: 0, quantity: 0, closingRate: '0.0%' },
      dailyHistory: []
    };
}