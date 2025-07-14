<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Lot } from "../features/lots/models/lot.ts";
import { LotService } from "../features/lots/services/lotService.ts";
import Modal from '../components/Modal.vue'
import LotForm from '../components/forms/LotForm.vue'

// Mock data for boissons (will be replaced with API call)
const boissons = ref([
  { id: 1, nom: 'Coca-Cola' },
  { id: 2, nom: 'Fanta' }
])

// Mock data for lots (will be replaced with API call)
const lots = ref<Lot[]>([
  {
    id: 1,
    numeroLot: 'LOT001',
    boisson: { id: 1, nom: 'Coca-Cola' },
    quantiteInitiale: 100,
    quantiteActuelle: 75,
    dateEntree: new Date('2025-07-01'),
    datePeremption: new Date('2025-12-31')
  },
  {
    id: 2,
    numeroLot: 'LOT002',
    boisson: { id: 2, nom: 'Fanta' },
    quantiteInitiale: 150,
    quantiteActuelle: 150,
    dateEntree: new Date('2025-07-13'),
    datePeremption: new Date('2025-08-13')
  }
])

const showModal = ref(false)
const modalTitle = ref('')
const selectedLot = ref<Lot | null>(null)

function openModal(){
  modalTitle.value = 'Ajouter un lot'
  selectedLot.value = null
  showModal.value = true
};

const closeModal = () => {
  showModal.value = false
  selectedLot.value = null
}

const editLot = (lot: Lot) => {
  selectedLot.value = { ...lot }
  modalTitle.value = 'Modifier le lot'
  showModal.value = true
}

// Chargement des données
onMounted(async () => {
  try {
    lots.value = await LotService.getAllLots();
  } catch (error) {
    console.error('Erreur lors du chargement des lots:', error);
  } finally {
    isLoading.value = false;
  }
});

const isLoading = ref(true);
const searchTerm = ref('');
const selectedFilter = ref('all');
const sortBy = ref('numero');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Tous les lots' },
  { value: 'valid', label: 'Valides' },
  { value: 'expired', label: 'Périmés' },
];

// Lots filtrés et triés
const filteredLots = computed(() => {
  let filtered = lots.value;

  // Filtre par recherche
  if (searchTerm.value) {
    filtered = filtered.filter(lot =>
        lot.numeroLot.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        (lot.boisson.nom && lot.boisson.nom.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
  }

  // Filtre par statut
  if (selectedFilter.value !== 'all') {
    const today = new Date().toISOString();
    filtered = filtered.filter(lot => {
      switch (selectedFilter.value) {
        case 'valid':
          return lot.datePeremption > today;
        case 'expired':
          return lot.datePeremption <= today;
        default:
          return true;
      }
    });
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Lot];
    const bValue = b[sortBy.value as keyof Lot];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc'
          ? aValue - bValue
          : bValue - aValue;
    }

    return 0;
  });

  return filtered;
});

// Fonction de tri
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
};

// Formatage de la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Vérifie si la date est proche de l'expiration
const isNearExpiration = (date: Date) => {
  const today = new Date()
  const expirationDate = new Date(date)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return expirationDate.getTime() - today.getTime() <= thirtyDays
}

// Récupère le statut d'un lot
const getLotStatus = (lot: Lot) => {
  if (new Date(lot.datePeremption) < new Date()) {
    return 'Expiré'
  }
  if (lot.quantiteActuelle === 0) {
    return 'Épuisé'
  }
  if (isNearExpiration(lot.datePeremption)) {
    return 'Proche péremption'
  }
  return 'Disponible'
}

// Récupère la classe CSS du statut d'un lot
const getLotStatusClass = (lot: Lot) => {
  const status = getLotStatus(lot)
  return {
    'status-expired': status === 'Expiré',
    'status-empty': status === 'Épuisé',
    'status-warning': status === 'Proche péremption',
    'status-available': status === 'Disponible'
  }
}

// Soumet le formulaire (ajout ou modification d'un lot)
const handleSubmit = (lotData: Lot) => {
  if (selectedLot.value) {
    // Met à jour un lot existant
    const index = lots.value.findIndex(l => l.id === selectedLot.value.id)
    if (index !== -1) {
      lots.value[index] = { ...lotData, id: selectedLot.value.id }
    }
  } else {
    // Ajoute un nouveau lot
    lots.value.push({
      ...lotData,
      id: lots.value.length + 1,
      numeroLot: `LOT${String(lots.value.length + 1).padStart(3, '0')}`
    })
  }
  closeModal()
}
</script>

<template>
  <div class="lots-container">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Lots</h2>
        <p class="table-subtitle">{{ filteredLots.length }} lot(s) trouvé(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal()">
          <PlusIcon class="w-4 h-4" />
          Ajouter
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
            placeholder="Rechercher un lot..."
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

    <!-- Tableau responsive -->
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des lots...</p>
      </div>

      <div v-else-if="filteredLots.length === 0" class="empty-state">
        <p>Aucun lot trouvé</p>
      </div>

      <table v-else class="modern-table">
        <thead>
        <tr>
          <th
              v-for="column in [
                { key: 'id', label: 'ID' },
                { key: 'numero', label: 'Numéro' },
                { key: 'boissonNom', label: 'Boisson' },
                { key: 'quantite', label: 'Quantité' },
                { key: 'datePeremption', label: 'Date de Péremption' },
              ]"
              :key="column.key"
              @click="handleSort(column.key)"
              class="sortable-header"
              :class="{ 'sorted': sortBy === column.key }"
          >
            {{ column.label }}
            <span class="sort-indicator">
                <span v-if="sortBy === column.key">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
          </th>
          <th class="actions-header">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="lot in filteredLots"
            :key="lot.id"
            class="table-row"
        >
          <td class="id-cell">{{ lot.id }}</td>
          <td class="name-cell">{{ lot.numeroLot }}</td>
          <td class="name-cell">{{ lot.boisson.nom }}</td>
          <td class="name-cell">{{ lot.quantiteActuelle }}</td>
          <td class="date-cell">
            <span class="date-value">{{ formatDate(lot.datePeremption) }}</span>
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button
                  @click="openModal(lot)"
                  class="action-btn action-btn-edit"
                  title="Modifier"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                  @click="handleDelete(lot)"
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

    <Modal v-model="showModal" :title="modalTitle">
      <LotForm
        :lot="selectedLot"
        :boissons="boissons"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
/* Import du système de design */


.lots-container {
  background: var(--color-bg-primary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  min-height: 100vh;
}

/* En-tête du tableau */
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

/* Barre de filtres */
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

/* Wrapper du tableau */
.table-wrapper {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

/* États de chargement et vide */
.loading-state, .empty-state {
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

/* Tableau moderne */
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

/* Cellules spécifiques */
.id-cell {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.name-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.date-cell {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Actions */
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

  .table-wrapper {
    overflow-x: auto;
  }

  .modern-table {
    min-width: 800px;
  }
}

/* Status styles */
.status-expired {
  color: var(--color-error-600);
  background: var(--color-error-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.status-empty {
  color: var(--color-warning-600);
  background: var(--color-warning-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.status-warning {
  color: var(--color-warning-600);
  background: var(--color-warning-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.status-available {
  color: var(--color-success-600);
  background: var(--color-success-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.text-danger {
  color: var(--color-error-600);
}
</style>
