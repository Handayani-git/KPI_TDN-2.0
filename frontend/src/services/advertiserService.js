import { differenceInDays, subDays } from 'date-fns';
import { fetchDataFromCollection } from './utils';
import { format } from 'date-fns';

export const getAdvertiserDashboardDataForPeriod = async (advId, startDate, endDate) => {
  // Jika advId adalah 'all', kita kirim null agar tidak difilter per user
  const filterValue = advId === 'all' ? null : advId;

  const currentPeriodData = await processAdvDataForDateRange(filterValue, startDate, endDate);
  
  let previousPeriodData = createEmptyAdvData();
  if (startDate && endDate) {
    const durationInDays = differenceInDays(endDate, startDate);
    const previousPeriodStartDate = subDays(startDate, durationInDays + 1);
    const previousPeriodEndDate = subDays(endDate, durationInDays + 1);
    previousPeriodData = await processAdvDataForDateRange(filterValue, previousPeriodStartDate, previousPeriodEndDate);
  }
  return { current: currentPeriodData, previous: previousPeriodData };
};

async function processAdvDataForDateRange(advId, startDate, endDate) {
    const adSpends = await fetchDataFromCollection('adSpends', startDate, endDate, advId ? 'advertiserId' : null, advId);
    const sales = await fetchDataFromCollection('sales', startDate, endDate, advId ? 'advertiserId' : null, advId);
    // Note: 'leads' are not directly tied to a single advertiser in this simplified model,
    // so we get it from the adSpends report for simplicity.
    const leads = await fetchDataFromCollection('leads', startDate, endDate, advId ? 'sourceAdvertiserId' : null, advId);


    const summary = { omset: 0, spend: 0, leads: 0, closing: 0 };

    adSpends.forEach(spend => {
        summary.spend += spend.spend;
    });

    leads.forEach(lead => {
        summary.leads += lead.leadCount;
    });

    sales.forEach(sale => {
        summary.omset += sale.omset;
        summary.closing += 1;
    });
    
    summary.roas = summary.spend > 0 ? (summary.omset / summary.spend).toFixed(2) : 0;
    
    const dailyHistory = {};
     [...adSpends, ...sales, ...leads].forEach(item => {
        const dateKey = format(item.date, 'yyyy-MM-dd');
        if (!dailyHistory[dateKey]) {
            dailyHistory[dateKey] = { date: item.date, omset: 0, spend: 0, closing: 0, leads: 0 };
        }
        dailyHistory[dateKey].omset += item.omset || 0;
        dailyHistory[dateKey].spend += item.spend || 0;
        dailyHistory[dateKey].leads += item.leadCount || 0;
        if (item.omset !== undefined) dailyHistory[dateKey].closing += 1;
    });

    return { summary, dailyHistory: Object.values(dailyHistory).sort((a,b) => b.date - a.date) };
}

function createEmptyAdvData() {
    return {
      summary: { omset: 0, spend: 0, leads: 0, closing: 0, roas: 0 },
      dailyHistory: []
    };
}