<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
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
  <div class="boisson-page">
    <!-- En-tête -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Boissons</h2>
        <p class="table-subtitle">{{ filteredBoissons.length }} boisson(s) trouvée(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal" :disabled="!isGerant">
          <PlusIcon class="w-4 h-4 mr-1" />
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
    <!-- Tableau -->
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
            <th @click="handleSort('nom')" class="sortable-header" :class="{ 'sorted': sortBy === 'nom' }">
              Nom
            </th>
            <th @click="handleSort('description')" class="sortable-header" :class="{ 'sorted': sortBy === 'description' }">
              Description
            </th>
            <th @click="handleSort('prixVente')" class="sortable-header" :class="{ 'sorted': sortBy === 'prixVente' }">
              Prix
            </th>
            <th @click="handleSort('isActive')" class="sortable-header" :class="{ 'sorted': sortBy === 'isActive' }">
              Statut
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="boisson in filteredBoissons" :key="boisson.id">
            <td>{{ boisson.nom }}</td>
            <td>{{ boisson.description }}</td>
            <td>{{ formatPrice(boisson.prix) }}</td>
            <td>
              <span class="status-badge" :class="boisson.isActive ? 'status-active' : 'status-inactive'">
                {{ boisson.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button class="btn btn-outline-secondary btn-sm" @click="handleToggleActive(boisson)" :disabled="!isGerant">
                {{ boisson.isActive ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn btn-outline-primary btn-sm" @click="handleEdit(boisson)" :disabled="!isGerant">Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Modal :model-value="showModal" :title="modalTitle" @update:modelValue="showModal = $event">
      <BoissonForm :boisson="selectedBoisson" @submit="handleSubmit" @cancel="closeModal" />
    </Modal>
  </div>
</template>

<style scoped>
.boisson-page {
  padding: 20px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px 0 10px 0;
}
.header-left {
  flex: 1;
}
.table-title {
  font-size: 1.7rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.table-subtitle {
  font-size: 1rem;
  color: #888;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-primary {
  background: #4285f4;
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
}
.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f2f2f2;
  border-radius: 8px;
  padding: 6px 12px;
}
.search-icon {
  margin-right: 8px;
  color: #888;
  width: 18px;
  height: 18px;
}
.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 1rem;
}
.filter-container {
  display: flex;
  align-items: center;
  background: #f2f2f2;
  border-radius: 8px;
  padding: 6px 12px;
}
.filter-icon {
  margin-right: 8px;
  color: #888;
  width: 18px;
  height: 18px;
}
.filter-select {
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;
}
.table-wrapper {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0;
  overflow-x: auto;
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.modern-table th, .modern-table td {
  border: 1px solid #dee2e6;
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
}
.modern-table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.modern-table th.sorted {
  color: #4285f4;
}
.status-badge {
  display: inline-block;
  padding: 0.25em 0.7em;
  font-size: 0.95em;
  border-radius: 0.5em;
  color: #fff;
}
.status-active {
  background: #34a853;
}
.status-inactive {
  background: #ea4335;
}
.btn-outline-secondary {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
  margin-right: 6px;
}
.btn-outline-primary {
  background: #fff;
  color: #4285f4;
  border: 1px solid #4285f4;
}
.btn-outline-secondary:disabled,
.btn-outline-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.loading-state, .empty-state {
  text-align: center;
  color: #888;
  padding: 40px 0;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@media (max-width: 900px) {
  .table-header, .filters-bar {
    flex-direction: column;
    gap: 12px;
  }
  .table-header {
    align-items: flex-start;
  }
}
</style>