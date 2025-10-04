// File: BarChart.js
// TIDAK PERLU ADA PERUBAHAN DI SINI

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart({ chartData, title }) {
const hasOmsetData = chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data.length > 0;
  const hasBudgetData = chartData && chartData.datasets && chartData.datasets[1] && chartData.datasets[1].data.length > 0;
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        
      },
    },
    scales: {
       y: { 
            type: 'linear',
            display: true,
            position: 'left',
            suggestedMin: 0,
            suggestedMax: hasOmsetData ? Math.max(...chartData.datasets[0].data) * 1.2 : 1000,
            ticks: {
                callback: function(value) {
                    if (value >= 1000000) return `Rp ${value / 1000000}jt`;
                    if (value >= 1000) return `Rp ${value / 1000}rb`;
                    return `Rp ${value}`;
                }
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
            suggestedMin: 0,
            suggestedMax: hasBudgetData ? Math.max(...chartData.datasets[1].data) * 1.2 : 1000,
            ticks: {
                callback: function(value) {
                    if (value >= 1000000) return `Rp ${value / 1000000}jt`;
                    if (value >= 1000) return `Rp ${value / 1000}rb`;
                    return `Rp ${value}`;
                }
            }
        }
    },
  };
   if (!hasOmsetData && !hasBudgetData) {
    return <div style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Tidak ada data untuk ditampilkan pada rentang ini.</div>;
  }

  return <Bar options={options} data={chartData} />;
}

export default BarChart;