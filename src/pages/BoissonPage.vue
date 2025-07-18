<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'
import type { Boisson } from "../features/boissons/models/boisson.ts";
import { BoissonService } from "../features/boissons/services/boissonService.ts";
import Modal from '../components/Modal.vue'
import BoissonForm from '../components/forms/BoissonForm.vue'
import { ElMessage } from 'element-plus';



const searchTerm = ref('');
const selectedFilter = ref('all');
const isLoading = ref(true);
const sortBy = ref('nom');
const sortOrder = ref<'asc' | 'desc'>('asc');
const showModal = ref(false)
const modalTitle = ref('')
const selectedBoisson = ref<Boisson | null>(null)
const boissons = ref<Boisson[]>([]);
const boisson = ref<Boisson | null>(null);
const boissonService = new BoissonService();


// Filtres disponibles
const filters = [
  { value: 'all', label: 'Toutes les boissons' },
  { value: 'active', label: 'Actives uniquement' },
  { value: 'inactive', label: 'Inactives uniquement' },
  { value: 'low-stock', label: 'Stock faible' }
];

onMounted(async () => {
  try {
    boissons.value = await BoissonService.getAllBoissons();
  } catch (error) {
    console.error('Erreur lors du chargement des boissons:', error);
  } finally {
    isLoading.value = false;
  }
});

// Boissons filtrées et triées
const filteredBoissons = computed(() => {
  let filtered = boissons.value;

  // Filtre par recherche
  if (searchTerm.value) {
    filtered = filtered.filter(boisson =>
        boisson.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        boisson.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  // Filtre par statut
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(boisson => {
      switch (selectedFilter.value) {
        case 'active':
          return boisson.isActive;
        case 'inactive':
          return !boisson.isActive;
        case 'low-stock':
          return boisson.seuil > 10; // Exemple de logique stock faible
        default:
          return true;
      }
    });
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Boisson];
    const bValue = b[sortBy.value as keyof Boisson];

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

// Formatage du prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(price);
};

// Fonctions d'actions (à implémenter selon vos besoins)
const handleDelete = (boisson: Boisson) => {
  console.log('Supprimer:', boisson);
};

const handleToggleActive = async (boisson: Boisson) => {
  try {
    const updatedBoisson = await BoissonService.activateOrDeactivateBoisson(boisson.id, !boisson.isActive);
    const index = boissons.value.findIndex(b => b.id === boisson.id);
    if (index !== -1) {
      boissons.value[index] = updatedBoisson;
    }
    ElMessage.success(`Boisson ${updatedBoisson.isActive ? 'activée' : 'désactivée'} avec succès !`);
  } catch (error) {
    console.error('Failed to toggle activation:', error);
    ElMessage.error('Erreur lors du changement de statut de la boisson.');
  }
};

const openModal = () => {
  modalTitle.value = 'Ajouter une boisson';
  selectedBoisson.value = null;
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false
  selectedBoisson.value = null
}

const handleSubmit = async (boissonData: Boisson) => {
  if (selectedBoisson.value) {
    // Update existing boisson
    try {
      console.log('Updating boisson:', boissonData);
      await BoissonService.updateBoisson(boissonData, selectedBoisson.value.id!);
      const index = boissons.value.findIndex(b => b.id === selectedBoisson.value?.id);
      if (index !== -1) {
        boissons.value[index] = { ...boissonData, id: selectedBoisson.value.id };
      }
    } catch (error) {
      console.error('Failed to update boisson:', error);
    }
  } else {
    // Add new boisson
    try {
      const newBoisson = await BoissonService.addBoisson(boissonData);
      boissons.value.push(newBoisson);
    } catch (error) {
      console.error('Failed to add boisson:', error);
    }
  }
  closeModal();
}

// Nouvelle fonction pour gérer l'édition
const handleEdit = (boisson: Boisson) => {
  selectedBoisson.value = { ...boisson };
  modalTitle.value = 'Modifier la boisson';
  showModal.value = true;
};
</script>

<template>
  <div class="boisson-page">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Boissons</h2>
        <p class="table-subtitle">{{ filteredBoissons.length }} boisson(s) trouvée(s)</p>
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
            placeholder="Rechercher une boisson..."
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
        <p>Chargement des boissons...</p>
      </div>

      <div v-else-if="filteredBoissons.length === 0" class="empty-state">
        <p>Aucune boisson trouvée</p>
      </div>

      <table v-else class="modern-table">
        <thead>
        <tr>
          <th
              v-for="column in [
                { key: 'id', label: 'ID' },
                { key: 'nom', label: 'Nom' },
                { key: 'description', label: 'Description' },
                { key: 'prix', label: 'Prix' },
                { key: 'volume', label: 'Volume' },
                { key: 'unite', label: 'Unité' },
                { key: 'seuil', label: 'Seuil' },
                { key: 'isActive', label: 'Statut' }
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
            v-for="boisson in filteredBoissons"
            :key="boisson.id"
            class="table-row"
            :class="{ 'inactive-row': !boisson.isActive }"
        >
          <td class="id-cell">{{ boisson.id }}</td>
          <td class="name-cell">
            <div class="product-info">
              <span class="product-name">{{ boisson.nom }}</span>
            </div>
          </td>
          <td class="description-cell">
            <span class="description-text">{{ boisson.description }}</span>
          </td>
          <td class="price-cell">
            <span class="price-value">{{ formatPrice(boisson.prix) }}</span>
          </td>
          <td class="volume-cell">{{ boisson.volume }}</td>
          <td class="unit-cell">
            <span class="unit-badge">{{ boisson.unite }}</span>
          </td>
          <td class="threshold-cell">
              <span
                  class="threshold-badge"
                  :class="{ 'threshold-low': boisson.seuil <= 10 }"
              >
                {{ boisson.seuil }}
              </span>
          </td>
          <td class="status-cell">
              <span
                  class="status-badge"
                  :class="boisson.isActive ? 'status-active' : 'status-inactive'"
              >
                {{ boisson.isActive ? 'Actif' : 'Inactif' }}
              </span>
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button
                  @click="handleEdit(boisson)"
                  class="action-btn action-btn-edit"
                  title="Modifier"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                  @click="handleToggleActive(boisson)"
                  class="action-btn action-btn-toggle"
                  :title="boisson.isActive ? 'Désactiver' : 'Activer'"
              >
                <EyeIcon v-if="boisson.isActive" class="w-4 h-4" />
                <EyeSlashIcon v-else class="w-4 h-4" />
              </button>
              <button
                  @click="handleDelete(boisson)"
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
      <BoissonForm
        :boisson="selectedBoisson"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </Modal>
  </div>
</template>

<style scoped>
/* Import du système de design */


.boisson-page {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.table-row.inactive-row {
  opacity: 0.6;
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

.description-cell {
  max-width: 200px;
}

.description-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
}

.price-cell {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
}

.unit-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.threshold-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  background: var(--color-info-50);
  color: var(--color-info-700);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.threshold-badge.threshold-low {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-active {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.status-inactive {
  background: var(--color-error-50);
  color: var(--color-error-700);
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

.action-btn-toggle {
  background: var(--color-info-50);
  color: var(--color-info-500);
}

.action-btn-toggle:hover {
  background: var(--color-info-100);
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
</style>