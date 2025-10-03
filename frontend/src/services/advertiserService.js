import { differenceInDays, subDays } from 'date-fns';
import { fetchDataFromCollection } from './utils';
import { format } from 'date-fns';

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
    const adSpends = await fetchDataFromCollection('adSpends', startDate, endDate, 'advertiserId', advId);
    const sales = await fetchDataFromCollection('sales', startDate, endDate, 'advertiserId', advId);
    const summary = { omset: 0, spend: 0, leads: 0, closing: 0 };

    adSpends.forEach(spend => summary.spend += spend.spend);
    sales.forEach(sale => {
        summary.omset += sale.omset;
        summary.closing += 1;
    });
    
    summary.roas = summary.spend > 0 ? (summary.omset / summary.spend).toFixed(2) : 0;
    
    const dailyHistory = {};
     [...adSpends, ...sales].forEach(item => {
        const dateKey = format(item.date, 'yyyy-MM-dd');
        if (!dailyHistory[dateKey]) dailyHistory[dateKey] = { date: item.date, omset: 0, spend: 0, closing: 0, leads: 0 };
        dailyHistory[dateKey].omset += item.omset || 0;
        dailyHistory[dateKey].spend += item.spend || 0;
        if(item.omset) dailyHistory[dateKey].closing += 1;
    });

    return { summary, dailyHistory: Object.values(dailyHistory) };
}

function createEmptyAdvData() {
    return {
      summary: { omset: 0, spend: 0, leads: 0, closing: 0, roas: 0 },
      dailyHistory: []
    };
}