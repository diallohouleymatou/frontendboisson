<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'
import type { Boisson } from "../features/boissons/models/boisson.ts";
import { BoissonService } from "../features/boissons/services/boissonService.ts";
import Modal from '../components/Modal.vue'
import BoissonForm from '../components/forms/BoissonForm.vue'
import { ElMessage } from 'element-plus';
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService';


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

const filteredBoissons = computed(() => {
  let filtered = boissons.value;

  if (searchTerm.value) {
    filtered = filtered.filter(boisson =>
        boisson.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        boisson.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(boisson => {
      switch (selectedFilter.value) {
        case 'active':
          return boisson.isActive;
        case 'inactive':
          return !boisson.isActive;
        case 'low-stock':
          return boisson.seuil > 10;
        default:
          return true;
      }
    });
  }

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

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(price);
};

const handleDelete = (boisson: Boisson) => {
  if (!isGerant.value) {
    handleUnauthorizedAction();
    return;
  }
  console.log('Supprimer:', boisson);
};

const handleEdit = (boisson: Boisson) => {
  if (!isGerant.value) {
    handleUnauthorizedAction();
    return;
  }
  selectedBoisson.value = { ...boisson };
  modalTitle.value = 'Modifier la boisson';
  showModal.value = true;
};

const handleToggleActive = async (boisson: Boisson) => {
  if (!isGerant.value) {
    handleUnauthorizedAction();
    return;
  }
  try {
    const updatedBoisson = await BoissonService.activateOrDeactivateBoisson(boisson.id);
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
    try {
      const newBoisson = await BoissonService.addBoisson(boissonData);
      boissons.value.push(newBoisson);
    } catch (error) {
      console.error('Failed to add boisson:', error);
    }
  }
  closeModal();
}

const currentUser = computed(() => UtilisateurService.getCurrentUser());
const isGerant = computed(() => currentUser.value?.role === 'GERANT');

const handleAddClick = () => {
  if (!isGerant.value) {
    ElMessage.warning("Vous n'avez pas le droit d'ajouter une boisson.");
    return;
  }
  openModal();
};

const handleUnauthorizedAction = (message = "Vous n'êtes pas autorisé à effectuer cette opération.") => {
  ElMessage.warning(message);
};
</script>

<template>
  <div class="boisson-page modern-container">
    <div class="table-header modern-header">
      <div class="header-left">
        <h2 class="table-title main-title">Gestion des Boissons</h2>
        <p class="table-subtitle">{{ filteredBoissons.length }} boisson(s) trouvée(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary btn-lg" @click="handleAddClick" :disabled="!isGerant">
          <PlusIcon class="w-5 h-5 mr-2" />
          Ajouter
        </button>
      </div>
    </div>
    <div class="filters-bar modern-filters">
      <div class="search-container modern-search">
        <MagnifyingGlassIcon class="search-icon" />
        <input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher une boisson..."
            class="search-input modern-input"
        />
      </div>
      <div class="filter-container modern-filter-select">
        <FunnelIcon class="filter-icon" />
        <select v-model="selectedFilter" class="filter-select modern-input">
          <option v-for="filter in filters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="table-wrapper modern-table-wrapper">
      <div v-if="isLoading" class="loading-state modern-loading">
        <div class="loading-spinner"></div>
        <p>Chargement des boissons...</p>
      </div>
      <div v-else-if="filteredBoissons.length === 0" class="empty-state modern-empty">
        <p>Aucune boisson trouvée</p>
      </div>
      <table v-else class="boisson-table modern-table">
        <thead>
        <tr>
          <th @click="handleSort('nom')" :class="{active: sortBy==='nom'}">Nom</th>
          <th @click="handleSort('description')" :class="{active: sortBy==='description'}">Description</th>
          <th @click="handleSort('prixVente')" :class="{active: sortBy==='prixVente'}">Prix</th>
          <th @click="handleSort('isActive')" :class="{active: sortBy==='isActive'}">Statut</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="boisson in filteredBoissons" :key="boisson.id" class="modern-row">
          <td>{{ boisson.nom }}</td>
          <td>{{ boisson.description }}</td>
          <td>{{ formatPrice(boisson.prix) }}</td>
          <td>
            <span :class="['status-badge', boisson.isActive ? 'active' : 'inactive']">
              {{ boisson.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td>
            <button class="btn btn-icon btn-toggle" @click="handleToggleActive(boisson)" :disabled="!isGerant" :title="boisson.isActive ? 'Désactiver' : 'Activer'">
              {{ boisson.isActive ? 'Désactiver' : 'Activer' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <Modal v-if="showModal" @close="closeModal">
      <template #title>{{ modalTitle }}</template>
      <BoissonForm :boisson="selectedBoisson" @submit="handleSubmit" @cancel="closeModal" />
    </Modal>
    <transition name="fade">
      <div v-if="feedbackMessage" :class="['feedback-message', feedbackType]">
        {{ feedbackMessage }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.boisson-page {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

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

.btn,
.btn-primary,
.btn-icon,
.btn-edit,
.btn-delete,
.btn-toggle {
  font-size: 1.1rem;
  min-width: 44px;
  min-height: 44px;
}

.btn-icon {
  padding: 0.5rem;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  margin-right: 0.2rem;
  transition: background 0.2s, box-shadow 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: #e0f7fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.btn-edit {
  color: #1976d2;
}
.btn-delete {
  color: #d32f2f;
}
.btn-toggle {
  color: #388e3c;
}

.btn[disabled], .btn-icon[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.table-wrapper {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

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