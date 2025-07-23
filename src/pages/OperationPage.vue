<template>
  <div class="operation-page">
    <!-- En-tête -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Suivi des Opérations</h2>
        <p class="table-subtitle">{{ filteredOperations.length }} opération(s) détaillée(s)</p>
        <p class="table-description">Historique complet de tous les mouvements par lot et leurs impacts sur le stock</p>
      </div>
      <div class="header-actions">
        <div class="stats-summary">
          <div class="stat-card">
            <span class="stat-number">{{ totalOperations }}</span>
            <span class="stat-label">Total opérations</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ operationsToday }}</span>
            <span class="stat-label">Aujourd'hui</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="filters-bar">
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher par lot, boisson, utilisateur..."
          class="search-input"
        />
      </div>

      <div class="filter-container">
        <FunnelIcon class="filter-icon" />
        <select v-model="selectedFilter" class="filter-select">
          <option v-for="filter in filters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>
      </div>

      <div class="date-filter">
        <CalendarDaysIcon class="filter-icon" />
        <select v-model="dateRange" class="filter-select">
          <option v-for="range in dateRanges" :key="range.value" :value="range.value">
            {{ range.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Tableau des opérations -->
    <div class="table-wrapper system-table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des opérations en cours...</p>
      </div>
      <div v-else-if="filteredOperations.length === 0" class="empty-state">
        <div class="empty-icon">
          <ClipboardDocumentListIcon class="w-12 h-12" />
        </div>
        <h3>Aucune opération trouvée</h3>
        <p>{{ searchTerm ? 'Aucun résultat pour ces critères' : 'Les opérations s\'afficheront ici une fois créées' }}</p>
      </div>
      <table v-else class="modern-table system-table">
        <thead>
          <tr>
            <th @click="handleSort('id')" class="sortable-header" :class="{ 'sorted': sortBy === 'id' }">
              ID Opération
              <span class="sort-indicator">{{ getSortIcon('id') }}</span>
            </th>
            <th>Type Mouvement</th>
            <th>Lot Concerné</th>
            <th>Boisson</th>
            <th @click="handleSort('quantite')" class="sortable-header" :class="{ 'sorted': sortBy === 'quantite' }">
              Quantité
              <span class="sort-indicator">{{ getSortIcon('quantite') }}</span>
            </th>
            <th>Impact Stock</th>
            <th>Date Opération</th>
            <th>Utilisateur</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operation in filteredOperations" :key="operation.id" class="table-row">
            <td class="id-cell">
              <span class="operation-id">#{{ operation.id }}</span>
            </td>
            <td class="type-cell">
              <span class="type-badge" :class="getTypeClass(operation.mouvement?.type)">
                <component :is="getTypeIcon(operation.mouvement?.type)" class="w-4 h-4" />
                {{ getTypeLabel(operation.mouvement?.type) }}
              </span>
            </td>
            <td class="lot-cell">
              <div class="lot-info">
                <span class="lot-number">{{ operation.lot?.numeroLot || 'N/A' }}</span>
                <span class="lot-details">
                  {{ operation.lot?.quantiteActuelle || 0 }}/{{ operation.lot?.quantiteInitiale || 0 }} unités
                </span>
              </div>
            </td>
            <td class="boisson-cell">
              <div class="boisson-info">
                <span class="boisson-name">{{ operation.lot?.boisson?.nom || 'Boisson inconnue' }}</span>
                <span class="boisson-details">
                  {{ operation.lot?.boisson?.unite || '' }}
                  {{ operation.lot?.boisson?.volume || '' }}
                </span>
              </div>
            </td>
            <td class="quantity-cell">
              <span class="quantity-value" :class="getQuantityClass(operation.mouvement?.type)">
                {{ formatQuantity(operation.quantite, operation.mouvement?.type) }}
              </span>
            </td>
            <td class="impact-cell">
              <div class="impact-indicator" :class="getImpactClass(operation.mouvement?.type)">
                <component :is="getImpactIcon(operation.mouvement?.type)" class="w-4 h-4" />
                <span>{{ getImpactText(operation.mouvement?.type) }}</span>
              </div>
            </td>
            <td class="date-cell">
              <div class="date-container">
                <span class="date-value">{{ formatDate(operation.mouvement?.dateMouvement) }}</span>
                <span class="date-relative">{{ getRelativeTime(operation.mouvement?.dateMouvement) }}</span>
              </div>
            </td>
            <td class="user-cell">
              <div class="user-info">
                <span class="user-name">{{ operation.mouvement?.utilisateur?.email || 'Utilisateur inconnu' }}</span>
                <span class="user-email">{{ operation.mouvement?.utilisateur?.email || '-' }}</span>
              </div>
            </td>
            <td class="actions-cell">
              <div class="actions-group">
                <button
                  @click="viewOperationDetails(operation)"
                  class="action-btn action-btn-view"
                  title="Voir les détails"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
                <button
                  @click="viewLotHistory(operation.lot)"
                  class="action-btn action-btn-history"
                  title="Historique du lot"
                >
                  <ClockIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour les détails d'opération -->
    <Modal v-model="showDetailsModal" title="Détails de l'Opération" size="large">
      <OperationDetails
        :operation="selectedOperation"
        @close="closeDetailsModal"
      />
    </Modal>

    <!-- Modal pour l'historique du lot -->
    <Modal v-model="showHistoryModal" title="Historique du Lot" size="large">
      <LotHistory
        :lot="selectedLot"
        @close="closeHistoryModal"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  ClockIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MinusIcon,
  ScaleIcon,
} from '@heroicons/vue/24/outline'
import type { LigneOperation } from '../features/inventaire/models/ligneOperation'
import type { Lot } from '../features/inventaire/models/lot'
import { inventaireService } from '../features/inventaire/services/inventaireService'
import Modal from '../components/Modal.vue'
import OperationDetails from '../components/OperationDetails.vue'
import LotHistory from '../components/LotHistory.vue'

// État principal
const operations = ref<LigneOperation[]>([])
const isLoading = ref(true)
const searchTerm = ref('')
const selectedFilter = ref('all')
const dateRange = ref('all')
const sortBy = ref('id')
const sortOrder = ref<'asc' | 'desc'>('desc')

// États des modals
const showDetailsModal = ref(false)
const showHistoryModal = ref(false)
const selectedOperation = ref<LigneOperation | null>(null)
const selectedLot = ref<Lot | null>(null)

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Toutes les opérations' },
  { value: 'ENTREE', label: 'Entrées uniquement' },
  { value: 'SORTIE', label: 'Sorties uniquement' },
  { value: 'AJUSTEMENT', label: 'Ajustements uniquement' },
]

const dateRanges = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
]

// Chargement des données
onMounted(async () => {
  await loadOperations()
})

const loadOperations = async () => {
  try {
    isLoading.value = true
    const result = await inventaireService.getAllLigneOperations()

    // Vérifier si le résultat est un tableau, sinon initialiser un tableau vide
    if (Array.isArray(result)) {
      operations.value = result
    } else {
      console.warn('Les données reçues ne sont pas un tableau:', result)
      operations.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des opérations:', error)
    operations.value = [] // S'assurer qu'on a toujours un tableau
    // TODO: Afficher toast d'erreur
  } finally {
    isLoading.value = false
  }
}

// Statistiques calculées
const totalOperations = computed(() => operations.value.length)

const operationsToday = computed(() => {
  const today = new Date().toDateString()
  return operations.value.filter(op =>
    op.mouvement?.dateMouvement &&
    new Date(op.mouvement.dateMouvement).toDateString() === today
  ).length
})

// Filtrage et tri
const filteredOperations = computed(() => {
  // S'assurer qu'on travaille toujours avec un tableau
  let filtered = Array.isArray(operations.value) ? operations.value : []

  // Filtre par recherche
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(operation =>
      (operation.lot?.numeroLot && operation.lot.numeroLot.toLowerCase().includes(search)) ||
      (operation.lot?.boisson?.nom && operation.lot.boisson.nom.toLowerCase().includes(search)) ||
      (operation.mouvement?.utilisateur?.email && operation.mouvement.utilisateur.email.toLowerCase().includes(search)) ||
      (operation.mouvement?.type && operation.mouvement.type.toLowerCase().includes(search))
    )
  }

  // Filtre par type de mouvement
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(operation =>
      operation.mouvement?.type === selectedFilter.value
    )
  }

  // Filtre par date
  if (dateRange.value !== 'all') {
    const now = new Date()
    filtered = filtered.filter(operation => {
      if (!operation.mouvement?.dateMouvement) return false
      const operationDate = new Date(operation.mouvement.dateMouvement)

      switch (dateRange.value) {
        case 'today':
          return operationDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return operationDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          return operationDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          return operationDate >= quarterAgo
        default:
          return true
      }
    })
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue: any, bValue: any

    if (sortBy.value === 'quantite') {
      aValue = a.quantite || 0
      bValue = b.quantite || 0
    } else if (sortBy.value === 'id') {
      aValue = a.id || 0
      bValue = b.id || 0
    } else {
      return 0
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return filtered
})

// Fonctions utilitaires
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (column: string) => {
  if (sortBy.value !== column) return ''
  return sortOrder.value === 'asc' ? '↑' : '↓'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getRelativeTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'À l\'instant'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  return ''
}

const getTypeClass = (type?: string) => {
  return {
    'type-entree': type === 'ENTREE',
    'type-sortie': type === 'SORTIE',
    'type-ajustement': type === 'AJUSTEMENT'
  }
}

const getTypeIcon = (type?: string) => {
  const icons: Record<string, any> = {
    'ENTREE': ArrowDownIcon,
    'SORTIE': ArrowUpIcon,
    'AJUSTEMENT': AdjustmentsHorizontalIcon
  }
  return icons[type || ''] || ClipboardDocumentListIcon
}

const getTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    'ENTREE': 'Entrée',
    'SORTIE': 'Sortie',
    'AJUSTEMENT': 'Ajustement'
  }
  return labels[type || ''] || 'Inconnu'
}

const getQuantityClass = (type?: string) => {
  return {
    'quantity-positive': type === 'ENTREE',
    'quantity-negative': type === 'SORTIE',
    'quantity-neutral': type === 'AJUSTEMENT'
  }
}

const formatQuantity = (quantity: number, type?: string) => {
  const sign = type === 'ENTREE' ? '+' : type === 'SORTIE' ? '-' : '±'
  return `${sign}${quantity}`
}

const getImpactClass = (type?: string) => {
  return {
    'impact-positive': type === 'ENTREE',
    'impact-negative': type === 'SORTIE',
    'impact-neutral': type === 'AJUSTEMENT'
  }
}

const getImpactIcon = (type?: string) => {
  const icons: Record<string, any> = {
    'ENTREE': PlusIcon,
    'SORTIE': MinusIcon,
    'AJUSTEMENT': ScaleIcon
  }
  return icons[type || ''] || ScaleIcon
}

const getImpactText = (type?: string) => {
  const texts: Record<string, string> = {
    'ENTREE': 'Stock augmenté',
    'SORTIE': 'Stock diminué',
    'AJUSTEMENT': 'Stock ajusté'
  }
  return texts[type || ''] || 'Impact inconnu'
}

// Gestion des modals
const viewOperationDetails = (operation: LigneOperation) => {
  selectedOperation.value = operation
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedOperation.value = null
}

const viewLotHistory = (lot?: Lot) => {
  if (lot) {
    selectedLot.value = lot
    showHistoryModal.value = true
  }
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedLot.value = null
}
</script>

<style scoped>
.operation-page {
  padding: 1.5rem;
  max-width: 100%;
}

/* En-tête */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 1rem;
  border: 1px solid #0ea5e9;
  box-shadow: 0 1px 3px 0 rgba(14, 165, 233, 0.1);
}

.table-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.table-subtitle {
  color: #0369a1;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.table-description {
  color: #075985;
  font-size: 0.75rem;
  font-style: italic;
}

/* Stats */
.stats-summary {
  display: flex;
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #0ea5e9;
  min-width: 100px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c4a6e;
}

.stat-label {
  font-size: 0.75rem;
  color: #0369a1;
  text-align: center;
}

/* Filtres */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.filter-container, .date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
  color: #64748b;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  min-width: 160px;
}

/* Tableau */
.table-wrapper {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.system-table-wrapper {
  background: var(--color-bg-elevated, #fff);
  border-radius: 0.75rem;
  border: 1px solid var(--color-border-light, #e2e8f0);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.system-table {
  background: var(--color-bg-primary, #fff);
  color: var(--color-text-primary, #1e293b);
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.system-table th {
  background: var(--color-bg-tertiary, #f8fafc);
  color: var(--color-text-secondary, #374151);
  border-bottom: 1px solid var(--color-border-light, #e5e7eb);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable-header:hover {
  background: #f1f5f9;
}

.sort-indicator {
  margin-left: 0.5rem;
  color: #0ea5e9;
  font-weight: bold;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.table-row:hover {
  background: #f8fafc;
}

/* Cellules spécialisées */
.operation-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #e0f2fe;
  border-radius: 0.25rem;
  color: #0c4a6e;
  font-weight: 600;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.type-entree {
  background: var(--color-success-50, #dcfce7);
  color: var(--color-success-700, #166534);
}

.type-sortie {
  background: var(--color-error-50, #fee2e2);
  color: var(--color-error-700, #991b1b);
}

.type-ajustement {
  background: var(--color-warning-50, #fefce8);
  color: var(--color-warning-700, #9a3412);
}

.lot-info, .boisson-info, .user-info {
  display: flex;
  flex-direction: column;
}

.lot-number, .boisson-name, .user-name {
  font-weight: 500;
  color: #1e293b;
}

.lot-details, .boisson-details, .user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.quantity-value {
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.quantity-positive {
  color: #059669;
}

.quantity-negative {
  color: #dc2626;
}

.quantity-neutral {
  color: #d97706;
}

.impact-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.impact-positive {
  background: var(--color-success-50, #dcfce7);
  color: var(--color-success-700, #166534);
}

.impact-negative {
  background: var(--color-error-50, #fee2e2);
  color: var(--color-error-700, #991b1b);
}

.impact-neutral {
  background: var(--color-warning-50, #fefce8);
}

.date-container {
  display: flex;
  flex-direction: column;
}

.date-value {
  font-weight: 500;
  color: #1e293b;
}

.date-relative {
  font-size: 0.75rem;
  color: #64748b;
}

/* Actions */
.actions-group {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-view {
  background: #e0f2fe;
  color: #0277bd;
}

.action-btn-view:hover {
  background: #b3e5fc;
}

.action-btn-history {
  background: #f3e8ff;
  color: #7c3aed;
}

.action-btn-history:hover {
  background: #e9d5ff;
}

/* États */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-icon {
  margin-bottom: 1rem;
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-summary {
    width: 100%;
    justify-content: space-around;
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-container {
    min-width: 100%;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 1000px;
  }
}
</style>
