<template>
  <div class="mouvement-page">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Mouvements de Stock</h2>
        <p class="table-subtitle">{{ filteredMouvements.length }} mouvement(s) dans l'historique</p>
      </div>
      <div class="header-actions">
        <div class="dropdown-container" @click.stop>
          <select v-model="selectedType" class="dropdown-select">
            <option disabled value="">Sélectionner un type de mouvement</option>
            <option value="ENTREE">Entrée de stock</option>
            <option value="ENTREE_BATCH">Entrée par lot</option>
            <option value="SORTIE">Sortie de stock</option>
            <option value="AJUSTEMENT">Ajustement</option>
          </select>
          <button class="btn btn-primary" @click="handleTypeSelection" :disabled="!selectedType">
            Créer un mouvement
          </button>
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
          placeholder="Rechercher par type, raison, utilisateur..."
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

      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-label">Total mouvements :</span>
          <span class="stat-value">{{ mouvements.length }}</span>
        </div>
      </div>
    </div>

    <!-- Tableau des mouvements -->
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement de l'historique des mouvements...</p>
      </div>

      <div v-else-if="filteredMouvements.length === 0" class="empty-state">
        <div class="empty-icon">
          <ArrowsUpDownIcon class="w-12 h-12" />
        </div>
        <h3>Aucun mouvement trouvé</h3>
        <p>{{ searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par créer votre premier mouvement' }}</p>
      </div>

      <table v-else class="modern-table">
        <thead>
          <tr>
            <th @click="handleSort('id')" class="sortable-header" :class="{ 'sorted': sortBy === 'id' }">
              ID
              <span class="sort-indicator">{{ getSortIcon('id') }}</span>
            </th>
            <th @click="handleSort('type')" class="sortable-header" :class="{ 'sorted': sortBy === 'type' }">
              Type de mouvement
              <span class="sort-indicator">{{ getSortIcon('type') }}</span>
            </th>
            <th @click="handleSort('dateMouvement')" class="sortable-header" :class="{ 'sorted': sortBy === 'dateMouvement' }">
              Date & Heure
              <span class="sort-indicator">{{ getSortIcon('dateMouvement') }}</span>
            </th>
            <th @click="handleSort('quantite')" class="sortable-header" :class="{ 'sorted': sortBy === 'quantite' }">
              Quantité
              <span class="sort-indicator">{{ getSortIcon('quantite') }}</span>
            </th>
            <th>Utilisateur</th>
            <th>Raison / Motif</th>
            <th>Type d'ajustement</th>
            <!-- Suppression de la colonne Actions -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="mouvement in filteredMouvements" :key="mouvement.id" class="table-row">
            <td class="id-cell">
              <span class="id-badge">#{{ mouvement.id }}</span>
            </td>
            <td class="type-cell">
              <span class="type-badge" :class="getTypeClass(mouvement.type)">
                <component :is="getTypeIcon(mouvement.type)" class="w-4 h-4" />
                {{ getTypeLabel(mouvement.type) }}
              </span>
            </td>
            <td class="date-cell">
              <div class="date-container">
                <span class="date-value">{{ formatDate(mouvement.dateMouvement) }}</span>
                <span class="date-relative">{{ getRelativeTime(mouvement.dateMouvement) }}</span>
              </div>
            </td>
            <td class="quantity-cell">
              <span class="quantity-value" :class="getQuantityClass(mouvement.type)">
                {{ formatQuantity(mouvement.quantite, mouvement.type) }}
              </span>
            </td>
            <td class="user-cell">
              <div class="user-info">
                <span class="user-name">{{ mouvement.utilisateur?.nom || 'Utilisateur inconnu' }}</span>
                <span class="user-email">{{ mouvement.utilisateur?.email || '-' }}</span>
              </div>
            </td>
            <td class="reason-cell">
              <span class="reason-text">{{ mouvement.raison || '-' }}</span>
            </td>
            <td class="adjustment-cell">
              <span v-if="mouvement.typeAjustement" class="adjustment-badge">
                {{ mouvement.typeAjustement }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <!-- Suppression de la cellule Actions -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals pour chaque type de mouvement -->
    <Modal v-model="modals.entree" title="Nouvelle Entrée de Stock">
      <EntreeForm
        @submit="handleEntreeSubmit"
        @cancel="closeModal('entree')"
        :is-loading="loadingStates.entree"
      />
    </Modal>

    <Modal v-model="modals.entreeBatch" title="Entrée par Lot - Traitement Groupé">
      <EntreeBatchForm
        @submit="handleEntreeBatchSubmit"
        @cancel="closeModal('entreeBatch')"
        :is-loading="loadingStates.entreeBatch"
      />
    </Modal>

    <Modal v-model="modals.sortie" title="Sortie de Stock">
      <SortieForm
        @submit="handleSortieSubmit"
        @cancel="closeModal('sortie')"
        :is-loading="loadingStates.sortie"
      />
    </Modal>

    <Modal v-model="modals.ajustement" title="Ajustement de Stock">
      <AjustementForm
        @submit="handleAjustementSubmit"
        @cancel="closeModal('ajustement')"
        :is-loading="loadingStates.ajustement"
      />
    </Modal>

    <!-- Modal pour les détails -->
    <Modal v-model="showDetailsModal" title="Détails du Mouvement" size="large">
      <MouvementDetails
        :mouvement="selectedMouvement"
        @close="closeDetailsModal"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ArchiveBoxIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import type { Mouvement } from '../features/inventaire/models/mouvement'
import { inventaireService } from '../features/inventaire/services/inventaireService'
import Modal from '../components/Modal.vue'
import EntreeForm from '../components/forms/EntreeForm.vue'
import EntreeBatchForm from '../components/forms/EntreeBatchForm.vue'
import SortieForm from '../components/forms/SortieForm.vue'
import AjustementForm from '../components/forms/AjustementForm.vue'
import MouvementDetails from '../components/MouvementDetails.vue'

// État principal
const mouvements = ref<Mouvement[]>([])
const isLoading = ref(true)
const searchTerm = ref('')
const selectedFilter = ref('all')
const sortBy = ref('dateMouvement')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showDropdown = ref(false)

// États des modals
const modals = ref({
  entree: false,
  entreeBatch: false,
  sortie: false,
  ajustement: false,
})

const loadingStates = ref({
  entree: false,
  entreeBatch: false,
  sortie: false,
  ajustement: false,
})

const showDetailsModal = ref(false)
const selectedMouvement = ref<Mouvement | null>(null)

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Tous les mouvements' },
  { value: 'ENTREE', label: 'Entrées uniquement' },
  { value: 'SORTIE', label: 'Sorties uniquement' },
  { value: 'AJUSTEMENT', label: 'Ajustements uniquement' },
]

// Chargement des données
onMounted(async () => {
  await loadMouvements()
  // Fermer le dropdown si on clique ailleurs
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const loadMouvements = async () => {
  try {
    isLoading.value = true
    mouvements.value = await inventaireService.getAllMouvements()
  } catch (error) {
    console.error('Erreur lors du chargement des mouvements:', error)
    // TODO: Afficher un toast d'erreur
  } finally {
    isLoading.value = false
  }
}

// Fonctions de gestion des modals
const openModal = (type: string) => {
  const modalMap: Record<string, keyof typeof modals.value> = {
    'ENTREE': 'entree',
    'ENTREE_BATCH': 'entreeBatch',
    'SORTIE': 'sortie',
    'AJUSTEMENT': 'ajustement',
  }
  const modalKey = modalMap[type]
  if (modalKey) {
    modals.value[modalKey] = true
  }
  showDropdown.value = false
}

const closeModal = (type: keyof typeof modals.value) => {
  modals.value[type] = false
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Fonctions de soumission pour chaque type
const handleEntreeSubmit = async (data: any) => {
  try {
    loadingStates.value.entree = true
    await inventaireService.createMouvementEntree(data)
    closeModal('entree')
    await loadMouvements() // Recharger la liste
    // TODO: Afficher toast de succès
  } catch (error) {
    console.error('Erreur lors de la création de l\'entrée:', error)
    // TODO: Afficher toast d'erreur
  } finally {
    loadingStates.value.entree = false
  }
}

const handleEntreeBatchSubmit = async (data: any) => {
  try {
    loadingStates.value.entreeBatch = true
    // Traitement en lot
    for (const lot of data.lots) {
      await inventaireService.createLot(lot)
    }
    closeModal('entreeBatch')
    await loadMouvements()
    // TODO: Afficher toast de succès
  } catch (error) {
    console.error('Erreur lors du traitement en lot:', error)
    // TODO: Afficher toast d'erreur
  } finally {
    loadingStates.value.entreeBatch = false
  }
}

const handleSortieSubmit = async (data: any) => {
  try {
    loadingStates.value.sortie = true
    await inventaireService.createMouvementSortie(data)
    closeModal('sortie')
    await loadMouvements()
    // TODO: Afficher toast de succès
  } catch (error) {
    console.error('Erreur lors de la création de la sortie:', error)
    // TODO: Afficher toast d'erreur
  } finally {
    loadingStates.value.sortie = false
  }
}

const handleAjustementSubmit = async (data: any) => {
  try {
    loadingStates.value.ajustement = true
    await inventaireService.createMouvementAjustement(data)
    closeModal('ajustement')
    await loadMouvements()
    // TODO: Afficher toast de succès
  } catch (error) {
    console.error('Erreur lors de la création de l\'ajustement:', error)
    // TODO: Afficher toast d'erreur
  } finally {
    loadingStates.value.ajustement = false
  }
}

const selectedType = ref("");
const handleTypeSelection = () => {
  if (selectedType.value) {
    openModal(selectedType.value);
    selectedType.value = "";
  }
}

// Fonctions utilitaires
const filteredMouvements = computed(() => {
  let filtered = mouvements.value

  // Filtre par recherche
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(mouvement =>
      mouvement.type.toLowerCase().includes(search) ||
      (mouvement.raison && mouvement.raison.toLowerCase().includes(search)) ||
      (mouvement.utilisateur?.email && mouvement.utilisateur.email.toLowerCase().includes(search)) ||
      (mouvement.utilisateur?.email && mouvement.utilisateur.email.toLowerCase().includes(search)) ||
      (mouvement.typeAjustement && mouvement.typeAjustement.toLowerCase().includes(search))
    )
  }

  // Filtre par type
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(mouvement => mouvement.type === selectedFilter.value)
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Mouvement]
    const bValue = b[sortBy.value as keyof Mouvement]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }

    return 0
  })

  return filtered
})

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'À l\'instant'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  return ''
}

const getTypeClass = (type: string) => {
  return {
    'type-entree': type === 'ENTREE',
    'type-sortie': type === 'SORTIE',
    'type-ajustement': type === 'AJUSTEMENT'
  }
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    'ENTREE': ArrowDownIcon,
    'SORTIE': ArrowUpIcon,
    'AJUSTEMENT': AdjustmentsHorizontalIcon
  }
  return icons[type] || ArrowsUpDownIcon
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'ENTREE': 'Entrée',
    'SORTIE': 'Sortie',
    'AJUSTEMENT': 'Ajustement'
  }
  return labels[type] || type
}

const getQuantityClass = (type: string) => {
  return {
    'quantity-positive': type === 'ENTREE',
    'quantity-negative': type === 'SORTIE',
    'quantity-neutral': type === 'AJUSTEMENT'
  }
}

const formatQuantity = (quantity: number, type: string) => {
  const sign = type === 'ENTREE' ? '+' : type === 'SORTIE' ? '-' : '±'
  return `${sign}${quantity}`
}

const viewMouvementDetails = (mouvement: Mouvement) => {
  selectedMouvement.value = mouvement
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedMouvement.value = null
}
</script>

<style scoped>
.mouvement-page {
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.table-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  /* Suppression du dégradé pour cohérence */
}

.table-subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

/* Dropdown */
.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.dropdown-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-width: 280px;
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.item-content {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-weight: 500;
  color: #1e293b;
}

.item-desc {
  font-size: 0.75rem;
  color: #64748b;
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
  min-width: 250px;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-container {
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
  min-width: 180px;
}

.stats-container {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 0.375rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.stat-value {
  font-weight: 600;
  color: #1e293b;
}

/* Tableau */
.table-wrapper {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
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
  color: #3b82f6;
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

/* Cellules spéciales */
.id-badge {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
  color: #64748b;
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
  background: #dcfce7;
  color: #166534;
}

.type-sortie {
  background: #fee2e2;
  color: #991b1b;
}

.type-ajustement {
  background: #fed7aa;
  color: #9a3412;
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

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1e293b;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.adjustment-badge {
  padding: 0.25rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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
  border-top: 2px solid #3b82f6;
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
    min-width: 800px;
  }
}
</style>