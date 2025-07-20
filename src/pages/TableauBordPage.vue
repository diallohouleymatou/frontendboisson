<script setup lang="ts">
import { ChartBarIcon, CubeIcon, InboxArrowDownIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import {computed, onMounted, ref} from 'vue'
import { StatService } from '../features/stats/services/statService'
import type { DashboardStatisticsDto } from '../features/stats/models/stat'

// État pour les statistiques du tableau de bord
const dashboardStats = ref<DashboardStatisticsDto | null>(null)
const loadingStats = ref(true)
const statsError = ref('')

// Récupération des statistiques au montage du composant
onMounted(async () => {
  try {
    dashboardStats.value = await StatService.getDashboardStats()
  } catch (e) {
    statsError.value = 'Erreur lors du chargement des statistiques.'
  } finally {
    loadingStats.value = false
  }
})

// Calcul des statistiques à afficher
const stats = computed(() => dashboardStats.value ? [
  { label: 'Total Boissons', value: dashboardStats.value.totalBeverages, icon: CubeIcon, color: 'primary' },
  { label: 'Lots en Stock', value: dashboardStats.value.totalStock, icon: InboxArrowDownIcon, color: 'accent' },
  { label: 'Utilisateurs', value: dashboardStats.value.totalUsers, icon: UserGroupIcon, color: 'success' },
  { label: 'Mouvements', value: dashboardStats.value.totalMovements, icon: ChartBarIcon, color: 'info' },
  { label: 'Valeur Totale', value: dashboardStats.value.totalValue, icon: ChartBarIcon, color: 'warning' },
  { label: 'Alertes Stock Faible', value: dashboardStats.value.lowStockAlerts, icon: InboxArrowDownIcon, color: 'danger' },
] : [])

// Mouvements récents
const recentMovements = [
  { id: 1, type: 'Entrée', produit: 'Coca-Cola 33cl', quantite: 50, date: '2024-01-15', status: 'success' },
  { id: 2, type: 'Sortie', produit: 'Eau Minérale 1L', quantite: 20, date: '2024-01-15', status: 'warning' },
  { id: 3, type: 'Entrée', produit: 'Jus d\'Orange 25cl', quantite: 30, date: '2024-01-14', status: 'success' },
  { id: 4, type: 'Sortie', produit: 'Sprite 33cl', quantite: 15, date: '2024-01-14', status: 'warning' }
]

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="dashboard-container">
    <!-- En-tête avec effet de lueur -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Tableau de Bord</h1>
        <p class="dashboard-subtitle">Vue d'ensemble de votre gestion de stock</p>
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- Statistiques avec animations -->
    <div class="stats-grid">
      <div v-if="loadingStats">Chargement des statistiques...</div>
      <div v-else-if="statsError">{{ statsError }}</div>
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
          <div class="stat-trend">
            <span class="trend-indicator">↗</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Alertes de stock -->
    <div v-if="dashboardStats?.stockAlerts && dashboardStats.stockAlerts.length" class="stock-alerts-section">
      <h2 class="section-title">Alertes de Stock Faible</h2>
      <table class="modern-table stock-alerts-table">
        <thead>
          <tr>
            <th>Boisson</th>
            <th>Quantité</th>
            <th>Seuil</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alert in dashboardStats.stockAlerts" :key="alert.lotId">
            <td>{{ alert.boisson }}</td>
            <td class="quantity-cell warning">{{ alert.quantite }}</td>
            <td>{{ alert.seuil }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mouvements récents avec design moderne -->
    <div class="movements-section">
      <div class="section-header">
        <h2 class="section-title">Mouvements Récents</h2>
        <button class="btn btn-outline">Voir tout</button>
      </div>

      <div class="table-container">
        <table class="modern-table">
          <thead>
          <tr>
            <th>Type</th>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="movement in recentMovements"
              :key="movement.id"
              class="table-row"
          >
            <td>
                <span
                    :class="movement.type === 'Entrée' ? 'badge badge-success' : 'badge badge-warning'"
                >
                  {{ movement.type }}
                </span>
            </td>
            <td class="product-cell">{{ movement.produit }}</td>
            <td class="quantity-cell">{{ movement.quantite }}</td>
            <td class="date-cell">{{ formatDate(movement.date) }}</td>
            <td>
              <div class="status-indicator" :class="`status-${movement.status}`"></div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Import du système de design */

.dashboard-container {
  min-height: 100vh;
  background: var(--color-bg-primary);
  padding: var(--space-6);
  animation: fadeIn 0.6s ease-out;
}

/* En-tête avec effet moderne */
.dashboard-header {
  position: relative;
  margin-bottom: var(--space-8);
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-accent-500));
}

.header-content {
  position: relative;
  z-index: 2;
}

.dashboard-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
}

.header-decoration {
  position: absolute;
  top: 50%;
  right: -50px;
  width: 200px;
  height: 200px;
  background: var(--color-primary-500);
  border-radius: 50%;
  opacity: 0.1;
  transform: translateY(-50%);
}

/* Grille de statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
  animation: slideUp 0.6s ease-out;
  animation-delay: var(--delay);
  animation-fill-mode: both;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: all var(--transition-base);
}

.stat-card--primary::before { background: var(--color-primary-500); }
.stat-card--accent::before { background: var(--color-accent-500); }
.stat-card--success::before { background: var(--color-success-500); }
.stat-card--info::before { background: var(--color-info-500); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.stat-card--primary:hover { box-shadow: var(--shadow-lg), var(--glow-primary); }
.stat-card--accent:hover { box-shadow: var(--shadow-lg), var(--glow-accent); }
.stat-card--success:hover { box-shadow: var(--shadow-lg), var(--glow-success); }

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  position: relative;
}

.stat-card--primary .stat-icon-wrapper { background: var(--color-primary-50); }
.stat-card--accent .stat-icon-wrapper { background: var(--color-accent-50); }
.stat-card--success .stat-icon-wrapper { background: var(--color-success-50); }
.stat-card--info .stat-icon-wrapper { background: var(--color-info-50); }

.stat-icon {
  width: 32px;
  height: 32px;
}

.stat-card--primary .stat-icon { color: var(--color-primary-500); }
.stat-card--accent .stat-icon { color: var(--color-accent-500); }
.stat-card--success .stat-icon { color: var(--color-success-500); }
.stat-card--info .stat-icon { color: var(--color-info-500); }

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.stat-trend {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}

.trend-indicator {
  color: var(--color-success-500);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

/* Section alertes de stock */
.stock-alerts-section {
  margin-bottom: var(--space-8);
}

.stock-alerts-table {
  margin-top: var(--space-4);
}

/* Section mouvements */
.movements-section {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-base);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-base);
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-primary-500);
  color: var(--color-primary-500);
}

.btn-outline:hover {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

/* Tableau moderne */
.table-container {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-primary);
}

.modern-table th {
  background: var(--color-bg-tertiary);
  padding: var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.modern-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.table-row {
  transition: all var(--transition-fast);
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

.table-row:last-child td {
  border-bottom: none;
}

/* Badges et indicateurs */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-success {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.badge-warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
}

.product-cell {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.quantity-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.date-cell {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 auto;
}

.status-success {
  background: var(--color-success-500);
}

.status-warning {
  background: var(--color-warning-500);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--space-4);
  }

  .dashboard-header {
    padding: var(--space-4);
  }

  .dashboard-title {
    font-size: var(--font-size-3xl);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .table-container {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }
}

/* Thème sombre spécifique */
[data-theme="dark"] .badge-success {
  background: var(--color-success-900);
  color: var(--color-success-300);
}

[data-theme="dark"] .badge-warning {
  background: var(--color-warning-900);
  color: var(--color-warning-300);
}
</style>