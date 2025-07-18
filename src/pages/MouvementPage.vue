<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/vue/24/outline'
import type { Mouvement } from "../features/inventaire/models/mouvement.ts";
import { inventaireService } from "../features/inventaire/services/inventaireService";
import Modal from '../components/Modal.vue'
import MouvementForm from '../components/forms/MouvementForm.vue'

const mouvements = ref<Mouvement[]>([])
const showModal = ref(false)
const modalTitle = ref('')
const selectedMouvement = ref<Mouvement | null>(null)
const showDropdown = ref(false)

function openModal(type?: string){
  modalTitle.value = type ? `Ajouter un mouvement (${type})` : 'Ajouter un mouvement'
  selectedMouvement.value = null
  showModal.value = true
  showDropdown.value = false
};

const closeModal = () => {
  showModal.value = false
  selectedMouvement.value = null
}

const editMouvement = (mouvement: Mouvement) => {
  selectedMouvement.value = { ...mouvement }
  modalTitle.value = 'Modifier le mouvement'
  showModal.value = true
}

// Chargement des données
onMounted(async () => {
  try {
    mouvements.value = await inventaireService.getAllMouvements();
  } catch (error) {
    console.error('Erreur lors du chargement des mouvements:', error);
  } finally {
    isLoading.value = false;
  }
});

const isLoading = ref(true);
const searchTerm = ref('');
const selectedFilter = ref('all');
const sortBy = ref('dateMouvement');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Tous les mouvements' },
  { value: 'ENTREE', label: 'Entrées' },
  { value: 'SORTIE', label: 'Sorties' },
  { value: 'AJUSTEMENT', label: 'Ajustements' },
];

// Mouvements filtrés et triés
const filteredMouvements = computed(() => {
  let filtered = mouvements.value;

  // Filtre par recherche
  if (searchTerm.value) {
    filtered = filtered.filter(mouvement =>
        mouvement.type.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        (mouvement.raison && mouvement.raison.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
        (mouvement.utilisateur?.nom && mouvement.utilisateur.nom.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
  }

  // Filtre par type
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(mouvement => mouvement.type === selectedFilter.value);
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Mouvement];
    const bValue = b[sortBy.value as keyof Mouvement];

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
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Récupère la classe CSS du type de mouvement
const getTypeClass = (type: string) => {
  return {
    'type-entree': type === 'ENTREE',
    'type-sortie': type === 'SORTIE',
    'type-ajustement': type === 'AJUSTEMENT'
  }
}

// Soumet le formulaire (ajout ou modification d'un mouvement)
const handleSubmit = (mouvementData: Mouvement) => {
  if (selectedMouvement.value) {
    // Met à jour un mouvement existant
    const index = mouvements.value.findIndex(m => m.id === selectedMouvement.value.id)
    if (index !== -1) {
      mouvements.value[index] = { ...mouvementData, id: selectedMouvement.value.id }
    }
  } else {
    // Ajoute un nouveau mouvement
    mouvements.value.push({
      ...mouvementData,
      id: mouvements.value.length + 1
    })
  }
  closeModal()
}

// Gère l'affichage du menu déroulant
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
}

// Gère la suppression d'un mouvement
const handleDelete = (mouvement: Mouvement) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) {
    const index = mouvements.value.findIndex(m => m.id === mouvement.id);
    if (index !== -1) {
      mouvements.value.splice(index, 1);
    }
  }
}
</script>

<template>
  <div class="mouvement-page">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Mouvements</h2>
        <p class="table-subtitle">{{ filteredMouvements.length }} mouvement(s) trouvé(s)</p>
      </div>
      <div class="header-actions">
        <div class="dropdown-container">
          <button class="btn btn-primary dropdown-trigger" @click="toggleDropdown">
            <PlusIcon class="w-4 h-4" />
            Nouveau mouvement
            <ChevronDownIcon class="w-4 h-4 ml-1" />
          </button>
          <div v-if="showDropdown" class="dropdown-menu">
            <button @click="openModal('ENTREE')" class="dropdown-item">
              <ArrowDownIcon class="w-4 h-4 text-green-600" />
              Entrée de stock
            </button>
            <button @click="openModal('SORTIE')" class="dropdown-item">
              <ArrowUpIcon class="w-4 h-4 text-red-600" />
              Sortie de stock
            </button>
            <button @click="openModal('AJUSTEMENT')" class="dropdown-item">
              <AdjustmentsHorizontalIcon class="w-4 h-4 text-orange-600" />
              Ajustement
            </button>
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
    </div>

    <!-- Tableau responsive -->
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
              v-for="column in [
                { key: 'id', label: 'ID' },
                { key: 'type', label: 'Type' },
                { key: 'dateMouvement', label: 'Date' },
                { key: 'quantite', label: 'Quantité' },
                { key: 'utilisateur', label: 'Utilisateur' },
                { key: 'raison', label: 'Raison' },
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
            v-for="mouvement in filteredMouvements"
            :key="mouvement.id"
            class="table-row"
        >
          <td class="id-cell">{{ mouvement.id }}</td>
          <td class="type-cell">
            <span class="type-badge" :class="getTypeClass(mouvement.type)">
              {{ mouvement.type }}
            </span>
          </td>
          <td class="date-cell">
            <span class="date-value">{{ formatDate(mouvement.dateMouvement) }}</span>
          </td>
          <td class="quantity-cell">
            <span class="quantity-value">{{ mouvement.quantite }}</span>
          </td>
          <td class="user-cell">
            <span class="user-name">{{ mouvement.utilisateur?.email || '-' }}</span>
          </td>
          <td class="reason-cell">
            <span class="reason-text">{{ mouvement.raison || '-' }}</span>
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button
                  @click="editMouvement(mouvement)"
                  class="action-btn action-btn-edit"
                  title="Modifier"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                  @click="handleDelete(mouvement)"
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

    <!-- Modal pour ajouter/modifier un mouvement -->
    <Modal v-model="showModal" :title="modalTitle">
      <MouvementForm
          :mouvement="selectedMouvement"
          @submit="handleSubmit"
          @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
.mouvement-page {
  padding: 20px;
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

/* Dropdown */
.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  min-width: 200px;
  margin-top: var(--space-2);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background-color: var(--color-bg-secondary);
}

.dropdown-item:first-child {
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.dropdown-item:last-child {
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
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

.type-cell {
  font-weight: var(--font-weight-semibold);
}

.type-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
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

.date-cell {
  font-size: var(--font-size-sm);
}

.date-value {
  color: var(--color-text-secondary);
}

.quantity-cell {
  font-weight: var(--font-weight-semibold);
}

.quantity-value {
  color: var(--color-text-primary);
}

.user-cell {
  font-size: var(--font-size-sm);
}

.user-name {
  color: var(--color-text-secondary);
}

.reason-cell {
  max-width: 200px;
}

.reason-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
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
  .mouvement-page {
    padding: var(--space-4);
  }

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

  .dropdown-menu {
    position: fixed;
    top: auto;
    right: var(--space-4);
    left: var(--space-4);
    width: auto;
  }
}

/* Variables CSS (à inclure dans votre fichier CSS global) */
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-10: 2.5rem;
  --space-16: 4rem;

  --radius-sm: 0.25rem;
  --radius-base: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-3xl: 1.875rem;

  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;

  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;

  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-elevated: #ffffff;
  --color-bg-muted: #f8fafc;

  --color-border-light: #e2e8f0;
  --color-border-medium: #cbd5e1;

  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #ffffff;

  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;

  --color-success-50: #f0fdf4;
  --color-success-700: #15803d;

  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-700: #b91c1c;

  --color-warning-50: #fefce8;
  --color-warning-700: #a3a700;

  --color-info-50: #f0f9ff;
  --color-info-500: #06b6d4;

  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

  --glow-primary: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>