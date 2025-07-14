<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'
import Modal from '../components/Modal.vue'
import StockForm from '../components/forms/StockForm.vue'
import type { Stock } from '../features/stocks/models/stock'
import type { TypeMouvement } from '../features/mouvements/models/typeMouvement'

// Mock data
const stocks = ref([
  {
    id: 1,
    boisson: { id: 1, nom: 'Coca-Cola', seuil: 50 },
    quantiteDisponible: 75
  },
  {
    id: 2,
    boisson: { id: 2, nom: 'Fanta', seuil: 30 },
    quantiteDisponible: 25
  }
])

const columns = [
  { key: 'nom', label: 'Produit' },
  { key: 'quantite', label: 'Quantité disponible' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' }
]

const filters = [
  { value: 'all', label: 'Tous les stocks' },
  { value: 'low', label: 'Stock faible' },
  { value: 'normal', label: 'Stock normal' }
]

const isLoading = ref(false)
const searchTerm = ref('')
const selectedFilter = ref('all')
const sortBy = ref('nom')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showModal = ref(false)
const modalTitle = ref('')
const selectedStock = ref<Stock | null>(null)
const selectedMouvementType = ref<TypeMouvement | null>(null)

// Chargement initial des données
onMounted(async () => {
  try {
    isLoading.value = true
    // await loadStocks()
  } catch (error) {
    console.error('Erreur lors du chargement des stocks:', error)
  } finally {
    isLoading.value = false
  }
})

// Computed properties
const filteredStocks = computed(() => {
  let filtered = stocks.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(stock =>
      stock.boisson.nom.toLowerCase().includes(search)
    )
  }

  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(stock => {
      const ratio = stock.quantiteDisponible / stock.boisson.seuil
      switch (selectedFilter.value) {
        case 'low':
          return ratio < 1.2
        case 'normal':
          return ratio >= 1.2
        default:
          return true
      }
    })
  }

  return filtered
})

// Methods
const getStockStatus = (stock: Stock) => {
  const ratio = stock.quantiteDisponible / stock.boisson.seuil
  if (stock.quantiteDisponible === 0) return 'Rupture'
  if (ratio <= 1) return 'Critique'
  if (ratio < 1.2) return 'Faible'
  return 'Normal'
}

const getStockStatusClass = (stock: Stock) => {
  const status = getStockStatus(stock)
  return {
    'status-empty': status === 'Rupture',
    'status-critical': status === 'Critique',
    'status-warning': status === 'Faible',
    'status-normal': status === 'Normal'
  }
}

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const openMouvementModal = (type: TypeMouvement, stock: Stock) => {
  selectedStock.value = stock
  selectedMouvementType.value = type
  modalTitle.value = `${type === 'ENTREE' ? 'Entrée' : type === 'SORTIE' ? 'Sortie' : 'Ajustement'} de stock - ${stock.boisson.nom}`
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedStock.value = null
  selectedMouvementType.value = null
}

const handleSubmit = async (data: any) => {
  try {
    // Implement stock movement logic here
    console.log('Stock movement:', data)
    closeModal()
  } catch (error) {
    console.error('Error during stock movement:', error)
  }
}
</script>

<template>
  <div class="stock-page">
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Stocks</h2>
        <p class="table-subtitle">{{ filteredStocks.length }} produit(s) en stock</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal">
          <PlusIcon class="w-4 h-4" />
          Nouveau mouvement
        </button>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="filters-bar">
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher un produit..."
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
    </div>

    <!-- Tableau des stocks -->
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des stocks...</p>
      </div>

      <div v-else-if="filteredStocks.length === 0" class="empty-state">
        <p>Aucun stock trouvé</p>
      </div>

      <table v-else class="modern-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="handleSort(column.key)"
              class="sortable-header"
              :class="{ 'sorted': sortBy === column.key }"
            >
              {{ column.label }}
              <span class="sort-indicator" v-if="sortBy === column.key">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stock in filteredStocks" :key="stock.id" class="table-row">
            <td>{{ stock.boisson.nom }}</td>
            <td>{{ stock.quantiteDisponible }}</td>
            <td>
              <div class="stock-status" :class="getStockStatusClass(stock)">
                {{ getStockStatus(stock) }}
              </div>
            </td>
            <td>
              <div class="actions-group">
                <button
                  @click="openMouvementModal('ENTREE', stock)"
                  class="action-btn action-btn-entry"
                  title="Entrée de stock"
                >
                  <ArrowUpTrayIcon class="w-4 h-4" />
                </button>
                <button
                  @click="openMouvementModal('SORTIE', stock)"
                  class="action-btn action-btn-exit"
                  title="Sortie de stock"
                >
                  <ArrowDownTrayIcon class="w-4 h-4" />
                </button>
                <button
                  @click="openMouvementModal('AJUSTEMENT', stock)"
                  class="action-btn action-btn-adjust"
                  title="Ajustement"
                >
                  <AdjustmentsHorizontalIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour les mouvements de stock -->
    <Modal v-model="showModal" :title="modalTitle">
      <StockForm
        :stock="selectedStock"
        :type-mouvement="selectedMouvementType"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
/* Common styles */
.stock-page {
  padding: var(--space-6);
}

/* Header styles */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.header-left {
  flex: 1;
}

.table-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.table-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-600);
}

/* Filter styles */
.filters-bar {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  width: 20px;
  height: 20px;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-10);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

/* Table styles */
.table-wrapper {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
}

.modern-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

/* Status styles */
.stock-status {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-empty {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.status-critical {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.status-warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
}

.status-normal {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

/* Action buttons */
.actions-group {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-start;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn-entry {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.action-btn-entry:hover {
  background: var(--color-success-100);
}

.action-btn-exit {
  background: var(--color-warning-50);
  color: var(--color-warning-600);
}

.action-btn-exit:hover {
  background: var(--color-warning-100);
}

.action-btn-adjust {
  background: var(--color-info-50);
  color: var(--color-info-600);
}

.action-btn-adjust:hover {
  background: var(--color-info-100);
}

/* Loading and empty states */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-light);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    gap: var(--space-4);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 600px;
  }
}
</style>
