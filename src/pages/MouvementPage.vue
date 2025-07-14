<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'
import Modal from '../components/Modal.vue'
import MouvementForm from '../components/forms/MouvementForm.vue'
import { MouvementService } from '../features/mouvements/services/mouvementService'
import type { Mouvement } from '../features/mouvements/models/mouvement'
import type { TypeMouvement } from '../features/mouvements/models/typeMouvement'
import type { TypeAjustement } from '../features/mouvements/models/typeAjustement'

// Mock data for development
const mouvements = ref([
  {
    id: 1,
    date: new Date(),
    type: 'ENTREE',
    quantite: 100,
    boisson: { id: 1, nom: 'Coca-Cola' },
    utilisateur: { id: 1, email: 'user@example.com' }
  },
  {
    id: 2,
    date: new Date(),
    type: 'SORTIE',
    quantite: 50,
    boisson: { id: 1, nom: 'Coca-Cola' },
    utilisateur: { id: 1, email: 'user@example.com' }
  },
  {
    id: 3,
    date: new Date(),
    type: 'AJUSTEMENT',
    typeAjustement: 'CASSE',
    raison: 'Bouteilles cassées pendant le transport',
    quantite: 10,
    boisson: { id: 1, nom: 'Coca-Cola' },
    utilisateur: { id: 1, email: 'user@example.com' }
  }
])

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'boisson', label: 'Produit' },
  { key: 'type', label: 'Type' },
  { key: 'quantite', label: 'Quantité' },
  { key: 'details', label: 'Détails' },
  { key: 'utilisateur', label: 'Utilisateur' }
]

const filters = [
  { value: 'all', label: 'Tous les mouvements' },
  { value: 'entree', label: 'Entrées' },
  { value: 'sortie', label: 'Sorties' },
  { value: 'ajustement', label: 'Ajustements' }
]

// State
const isLoading = ref(false)
const searchTerm = ref('')
const selectedFilter = ref('all')
const sortBy = ref('date')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showModal = ref(false)
const modalTitle = ref('Nouveau mouvement')
const dateRange = ref({
  start: '',
  end: new Date().toISOString().split('T')[0]
})
const showEditModal = ref(false)
const selectedMouvement = ref<Mouvement | null>(null)

// Load initial data
onMounted(async () => {
  try {
    isLoading.value = true
    const response = await MouvementService.getAllMouvements()
    mouvements.value = response
  } catch (error) {
    console.error('Erreur lors du chargement des mouvements:', error)
  } finally {
    isLoading.value = false
  }
})

// Computed
const filteredMouvements = computed(() => {
  let filtered = mouvements.value

  // Filter by search term
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(mouvement =>
      mouvement.boisson.nom.toLowerCase().includes(search) ||
      mouvement.utilisateur.email.toLowerCase().includes(search)
    )
  }

  // Filter by type
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(mouvement => {
      switch (selectedFilter.value) {
        case 'entree':
          return mouvement.type === 'ENTREE'
        case 'sortie':
          return mouvement.type === 'SORTIE'
        case 'ajustement':
          return mouvement.type === 'AJUSTEMENT'
        default:
          return true
      }
    })
  }

  // Filter by date range
  if (dateRange.value.start) {
    filtered = filtered.filter(mouvement =>
      new Date(mouvement.date) >= new Date(dateRange.value.start)
    )
  }
  if (dateRange.value.end) {
    filtered = filtered.filter(mouvement =>
      new Date(mouvement.date) <= new Date(dateRange.value.end)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Mouvement]
    const bValue = b[sortBy.value as keyof Mouvement]

    if (sortBy.value === 'date') {
      return sortOrder.value === 'asc'
        ? new Date(aValue as Date).getTime() - new Date(bValue as Date).getTime()
        : new Date(bValue as Date).getTime() - new Date(aValue as Date).getTime()
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return 0
  })

  return filtered
})

// Methods
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMouvementTypeLabel = (type: TypeMouvement) => {
  switch (type) {
    case 'ENTREE':
      return 'Entrée'
    case 'SORTIE':
      return 'Sortie'
    case 'AJUSTEMENT':
      return 'Ajustement'
    default:
      return type
  }
}

const getMouvementTypeClass = (type: TypeMouvement) => {
  switch (type) {
    case 'ENTREE':
      return 'type-entree'
    case 'SORTIE':
      return 'type-sortie'
    case 'AJUSTEMENT':
      return 'type-ajustement'
    default:
      return ''
  }
}

const getAjustementTypeLabel = (type: TypeAjustement) => {
  switch (type) {
    case 'CASSE':
      return 'Casse'
    case 'VOL':
      return 'Vol'
    case 'PERTE':
      return 'Perte'
    case 'RETOUR_CLIENT':
      return 'Retour client'
    default:
      return type
  }
}

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

const openEditModal = (mouvement: Mouvement) => {
  selectedMouvement.value = { ...mouvement }
  modalTitle.value = 'Modifier le mouvement'
  showModal.value = true
}

const handleDeleteMouvement = async (mouvement: Mouvement) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce mouvement du ${formatDate(mouvement.date)} ?`)) {
    return
  }
  try {
    isLoading.value = true
    await MouvementService.deleteMouvement(mouvement.id)
    const response = await MouvementService.getAllMouvements()
    mouvements.value = response
  } catch (error) {
    console.error('Erreur lors de la suppression du mouvement:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (data: any) => {
  try {
    isLoading.value = true
    if (selectedMouvement.value) {
      await MouvementService.updateMouvement(selectedMouvement.value.id, data)
    } else {
      await MouvementService.createMouvement(data)
    }
    closeModal()
    const response = await MouvementService.getAllMouvements()
    mouvements.value = response
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du mouvement:', error)
  } finally {
    isLoading.value = false
    selectedMouvement.value = null
  }
}

const openModal = () => {
  modalTitle.value = 'Nouveau mouvement'
  selectedMouvement.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedMouvement.value = null
}
</script>

<template>
  <div class="mouvement-page">
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Historique des Mouvements</h2>
        <p class="table-subtitle">{{ filteredMouvements.length }} mouvement(s)</p>
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
          placeholder="Rechercher un mouvement..."
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

      <div class="date-range-container">
        <input
          v-model="dateRange.start"
          type="date"
          class="date-input"
          :max="dateRange.end"
        />
        <span class="date-separator">à</span>
        <input
          v-model="dateRange.end"
          type="date"
          class="date-input"
          :min="dateRange.start"
        />
      </div>
    </div>

    <!-- Tableau des mouvements -->
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des mouvements...</p>
      </div>

      <div v-else-if="filteredMouvements.length === 0" class="empty-state">
        <p>Aucun mouvement trouvé</p>
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
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mouvement in filteredMouvements" :key="mouvement.id" class="table-row">
            <td>{{ formatDate(mouvement.date) }}</td>
            <td class="product-cell">
              <span class="product-name">{{ mouvement.boisson.nom }}</span>
            </td>
            <td>
              <span class="mouvement-type" :class="getMouvementTypeClass(mouvement.type)">
                {{ getMouvementTypeLabel(mouvement.type) }}
              </span>
            </td>
            <td class="quantity-cell">
              <span :class="{'text-success': mouvement.type === 'ENTREE', 'text-danger': mouvement.type === 'SORTIE'}">
                {{ mouvement.type === 'ENTREE' ? '+' : '-' }}{{ mouvement.quantite }}
              </span>
            </td>
            <td class="details-cell">
              <div v-if="mouvement.type === 'AJUSTEMENT'" class="ajustement-info">
                <span class="ajustement-type">{{ getAjustementTypeLabel(mouvement.typeAjustement) }}</span>
                <span v-if="mouvement.raison" class="raison-text">
                  - {{ mouvement.raison }}
                </span>
              </div>
              <span v-else>-</span>
            </td>
            <td class="user-cell">{{ mouvement.utilisateur.email }}</td>
            <td class="actions-cell">
              <div class="actions-group">
                <button
                  @click="openEditModal(mouvement)"
                  class="action-btn action-btn-edit"
                  title="Modifier"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="handleDeleteMouvement(mouvement)"
                  class="action-btn action-btn-delete"
                  title="Supprimer"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour nouveau mouvement -->
    <Modal v-model="showModal" :title="modalTitle">
      <MouvementForm
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
/* Common styles */
.mouvement-page {
  padding: 20px;
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
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.table-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--glow-primary);
}

/* Filter styles */
.filters-bar {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-500)1a;
}

.filter-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.filter-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
}

.date-range-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  width: 150px;
}

.date-separator {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Table wrapper */
.table-wrapper {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

/* Table styles */
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
  border-bottom: 2px solid var(--color-border-medium);
  position: relative;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-base);
}

.sortable-header:hover {
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
}

.sortable-header.sorted {
  color: var(--color-primary-500);
}

.sort-indicator {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-sm);
}

.actions-header {
  width: 120px;
  text-align: center;
}

.modern-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.table-row {
  transition: all var(--transition-fast);
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

/* Specific cell styles */
.product-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.quantity-cell {
  font-weight: var(--font-weight-medium);
}

.text-success {
  color: var(--color-success-600);
}

.text-danger {
  color: var(--color-error-600);
}

.details-cell {
  max-width: 200px;
}

.user-cell {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Movement type badges */
.mouvement-type {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.type-entree {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.type-sortie {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.type-ajustement {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
}

/* Adjustment details */
.ajustement-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-tight);
}

.ajustement-type {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.raison-text {
  font-style: italic;
  color: var(--color-text-tertiary);
}

/* Action buttons */
.actions-group {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn-edit {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.action-btn-edit:hover {
  background: var(--color-primary-100);
}

.action-btn-delete {
  background: var(--color-error-50);
  color: var(--color-error-500);
}

.action-btn-delete:hover {
  background: var(--color-error-100);
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

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-container {
    min-width: auto;
  }

  .date-range-container {
    flex-direction: column;
    width: 100%;
  }

  .date-input {
    width: 100%;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }
}
</style>