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

    <!-- Mouvements récents avec design moderne -->
    <!-- La section du tableau des mouvements récents a été supprimée pour un design plus épuré -->
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
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: 0;
}

/* Grille de statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: var(--space-5) var(--space-4);
  border: 1px solid var(--color-border-light);
  animation: fadeInUp 0.5s cubic-bezier(.23,1.01,.32,1) both;
  animation-delay: var(--delay);
}

.stat-card--primary { border-left: 4px solid var(--color-primary-500); }
.stat-card--accent { border-left: 4px solid var(--color-accent-500); }
.stat-card--success { border-left: 4px solid var(--color-success-500); }
.stat-card--info { border-left: 4px solid var(--color-info-500); }
.stat-card--warning { border-left: 4px solid var(--color-warning-500); }
.stat-card--danger { border-left: 4px solid var(--color-danger-500); }

.stat-icon-wrapper {
  background: var(--color-bg-secondary);
  border-radius: 50%;
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 2.2rem;
  height: 2.2rem;
  color: var(--color-primary-500);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dashboard-message {
  padding: 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: center;
}

.dashboard-message.loading {
  background: #e3f2fd;
  color: #1976d2;
}

.dashboard-message.error {
  background: #ffebee;
  color: #d32f2f;
}


/* Section mouvements */
.movements-section {
  margin-bottom: var(--space-8);
  background: var(--color-bg-elevated);
  border-radius: 10px;
  padding: var(--space-5);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-outline {
  background: #fff;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn-outline:hover {
  background: #1976d2;
  color: #fff;
}

/* Badges et indicateurs */
.badge {
  display: inline-block;
  padding: 0.2em 0.7em;
  border-radius: 12px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
}

.badge-success {
  background: #43a047;
}

.badge-warning {
  background: #ffa000;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}

.status-success {
  background: #43a047;
}

.status-warning {
  background: #ffa000;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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