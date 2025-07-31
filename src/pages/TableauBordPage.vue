<template>
  <div class="dashboard-container">
    <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div class="header-content">
        <h1 class="dashboard-title">Tableau de Bord</h1>
        <p class="dashboard-subtitle">Vue d'ensemble de votre gestion de stock</p>
      </div>
      <button class="logout-btn" @click="logoutAndRedirect">Se déconnecter</button>
      <div class="header-decoration"></div>
    </div>
    <div class="stats-grid">
      <div v-if="loadingStats" class="dashboard-message loading">Chargement des statistiques...</div>
      <div v-else-if="statsError" class="dashboard-message error">{{ statsError }}</div>
      <template v-else>
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="stat-card"
          :class="`stat-card--${stat.color}`"
          :style="{ '--delay': `${index * 0.1}s` }"
        >
          <div class="stat-icon-wrapper">
            <component :is="stat.icon" class="stat-icon" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon, CubeIcon, InboxArrowDownIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import {computed, onMounted, ref} from 'vue'
import { StatService } from '../features/stats/services/statService'
import type { DashboardStatisticsDto } from '../features/stats/models/stat'
import { useRouter } from 'vue-router'

const router = useRouter()

const dashboardStats = ref<DashboardStatisticsDto | null>(null)
const loadingStats = ref(true)
const statsError = ref('')

onMounted(async () => {
  try {
    dashboardStats.value = await StatService.getDashboardStats()
  } catch (e) {
    statsError.value = 'Erreur lors du chargement des statistiques.'
  } finally {
    loadingStats.value = false
  }
})
const stats = computed(() => dashboardStats.value ? [
  { label: 'Total Boissons', value: dashboardStats.value.totalBeverages, icon: CubeIcon, color: 'primary' },
  { label: 'Lots en Stock', value: dashboardStats.value.totalStock, icon: InboxArrowDownIcon, color: 'accent' },
  { label: 'Utilisateurs', value: dashboardStats.value.totalUsers, icon: UserGroupIcon, color: 'success' },
  { label: 'Mouvements', value: dashboardStats.value.totalMovements, icon: ChartBarIcon, color: 'info' },
  { label: 'Valeur Totale', value: dashboardStats.value.totalValue, icon: ChartBarIcon, color: 'warning' },
  { label: 'Alertes Stock Faible', value: dashboardStats.value.lowStockAlerts, icon: InboxArrowDownIcon, color: 'danger' },
] : [])

function logoutAndRedirect() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.dashboard-header {
  background-color: #ffffff;
  padding: 20px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  margin-bottom: 30px;
}

.dashboard-title {
  font-size: 24px;
  color: #333333;
  margin: 0 0 10px 0;
}

.dashboard-subtitle {
  font-size: 16px;
  color: #666666;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  padding: 15px;
  display: flex;
  align-items: center;
  border-left: 4px solid #999999;
  border-radius: 5px;
}

.stat-icon-wrapper {
  background-color: #eeeeee;
  padding: 10px;
  border-radius: 50%;
  margin-right: 15px;
}

.stat-icon {
  width: 28px;
  height: 28px;
  color: #555555;
}

.stat-content {
  flex-grow: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #222222;
}

.stat-label {
  font-size: 14px;
  color: #777777;
}

.dashboard-message {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-radius: 4px;
  margin-bottom: 15px;
}

.dashboard-message.loading {
  background-color: #e0f0ff;
  color: #005699;
}

.dashboard-message.error {
  background-color: #ffe0e0;
  color: #990000;
}

.logout-btn {
  background-color: transparent;
  border: none;
  color: #007bff;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.logout-btn:hover {
  color: #0056b3;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    padding: 15px;
  }
}

</style>