<template>
  <div class="analyse-page">
    <h1>Statistics Analysis</h1>
    <div class="chart-section">
      <h2>Daily Movements</h2>
      <template v-if="hasDailyData">
        <LineChart :data="dailyMovementsChartData" :options="lineChartOptions" />
      </template>
      <div v-else class="empty-state">
        <img src="/vite.svg" alt="No data" class="empty-illustration" />
        <p>No daily movement data available for the selected period.</p>
      </div>
    </div>
    <div class="chart-section">
      <h2>Weekly Stock Movement</h2>
      <template v-if="hasWeeklyData">
        <BarChart :data="weeklyStockChartData" :options="barChartOptions" />
      </template>
      <div v-else class="empty-state">
        <img src="/vite.svg" alt="No data" class="empty-illustration" />
        <p>No weekly stock movement data available.</p>
      </div>
    </div>
    <div class="chart-section">
      <h2>Stock Alerts</h2>
      <table v-if="stockAlerts && stockAlerts.length" class="stock-table">
        <thead>
          <tr>
            <th>Beverage</th>
            <th>Current Stock</th>
            <th>Threshold</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alert in stockAlerts" :key="alert.beverageName">
            <td>{{ alert.beverageName }}</td>
            <td>{{ alert.currentStockLevel }}</td>
            <td>{{ alert.thresholdLevel }}</td>
            <td>
              <span :class="['badge', alert.alertSeverityLevel.toLowerCase()]">
                {{ alert.alertSeverityLevel }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <img src="/vite.svg" alt="No alerts" class="empty-illustration" />
        <p>No stock alerts. All stocks are healthy!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Line, Bar } from 'vue-chartjs';
import {AnalysisService} from './../features/stats/services/statService.ts'; // Adjust the import path as needed
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement);

const dailyMovements = ref<any>(null);
const weeklyStockMovement = ref<any>(null);
const stockAlerts = ref<any[]>([]);

const fetchStats = async () => {
  try {
    // Get today's date and 7 days later in ISO format
    const today = new Date();
    const weekLater = new Date();
    weekLater.setDate(today.getDate() + 7);
    const start = today.toISOString().split('T')[0];
    const end = weekLater.toISOString().split('T')[0];
    const [dailyRes, weeklyRes, stockRes] = await Promise.all([
      AnalysisService.getDailyMovements(start, end),
      AnalysisService.getWeeklyStockMovement(),
      AnalysisService.getStockAlerts()
    ]);

    dailyMovements.value = dailyRes;
    weeklyStockMovement.value = weeklyRes;
    stockAlerts.value = stockRes;
  } catch (e) {
    dailyMovements.value = null;
    weeklyStockMovement.value = null;
    stockAlerts.value = [];
    console.error('Error fetching statistics:', e);
  }
};

onMounted(fetchStats);

const dailyMovementsChartData = computed(() => {
  if (!dailyMovements.value) return null;
  return {
    labels: dailyMovements.value.dates,
    datasets: [
      {
        label: 'Entries',
        data: dailyMovements.value.entries,
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.2)',
        fill: true
      },
      {
        label: 'Exits',
        data: dailyMovements.value.exits,
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.2)',
        fill: true
      },
      {
        label: 'Adjustments',
        data: dailyMovements.value.adjustments,
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.2)',
        fill: true
      }
    ]
  };
});

const weeklyStockChartData = computed(() => {
  if (!weeklyStockMovement.value) return null;
  return {
    labels: weeklyStockMovement.value.weekDates,
    datasets: weeklyStockMovement.value.datasets.map((ds: any) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || 'blue',
      borderColor: ds.color || 'blue',
      fill: false
    }))
  };
});

const hasDailyData = computed(() => {
  return dailyMovements.value && (
    (dailyMovements.value.entries && dailyMovements.value.entries.length > 0) ||
    (dailyMovements.value.exits && dailyMovements.value.exits.length > 0) ||
    (dailyMovements.value.adjustments && dailyMovements.value.adjustments.length > 0)
  );
});
const hasWeeklyData = computed(() => {
  return weeklyStockMovement.value && weeklyStockMovement.value.datasets && weeklyStockMovement.value.datasets.some((ds: any) => ds.data && ds.data.length > 0);
});

const lineChartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { position: 'top' as const, labels: { font: { size: 14 }, color: '#333' } },
    title: { display: false },
    tooltip: { enabled: true, backgroundColor: '#222', titleColor: '#fff', bodyColor: '#fff' }
  },
  elements: {
    line: { borderWidth: 3, tension: 0.4 },
    point: { radius: 5, backgroundColor: '#fff', borderWidth: 2 }
  },
  scales: {
    x: { grid: { color: '#eee' }, ticks: { color: '#888', font: { size: 13 } } },
    y: { grid: { color: '#eee' }, ticks: { color: '#888', font: { size: 13 } } }
}}));
const barChartOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: { position: 'top' as const, labels: { font: { size: 14 }, color: '#333' } },
    title: { display: false },
    tooltip: { enabled: true, backgroundColor: '#222', titleColor: '#fff', bodyColor: '#fff' }
  },
  elements: {
    bar: { borderRadius: 8, borderSkipped: false }
  },
  scales: {
    x: { grid: { color: '#eee' }, ticks: { color: '#888', font: { size: 13 } } },
    y: { grid: { color: '#eee' }, ticks: { color: '#888', font: { size: 13 } } }
}}));

// Chart components
const LineChart = Line;
const BarChart = Bar;
</script>

<style scoped>
.analyse-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f7f9fb;
}
.chart-section {
  margin-bottom: 2.5rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 2rem 2rem 1.5rem 2rem;
  position: relative;
}
.chart-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
  color: #2a2a2a;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  color: #888;
}
.empty-illustration {
  width: 60px;
  margin-bottom: 1rem;
  opacity: 0.7;
}
.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.stock-table th, .stock-table td {
  border: 1px solid #e3e6ea;
  padding: 10px 12px;
  text-align: left;
  color: #0e3460;
}
.stock-table th {
  background: #f1f3f7;
  color: #333;
}
.stock-table tr:nth-child(even) {
  background: #f7f9fb;
}
.stock-table tr:hover {
  background: #eaf3fb;
}
.badge {
  display: inline-block;
  padding: 0.25em 0.7em;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
}
.badge.ok { background: #4caf50; }
.badge.warning { background: #ff9800; }
.badge.critical { background: #f44336; }
</style>