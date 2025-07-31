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
import { inventaireService } from "../features/inventaire/services/inventaireService";
import Modal from '../components/Modal.vue'
import LotForm from '../components/forms/LotForm.vue'

// Mock data for boissons (will be replaced with API call)
// Mock data for boissons (will be replaced with API call)
const boissons = ref([
  { id: 1, nom: 'Coca-Cola' },
  { id: 2, nom: 'Fanta' }
])
// const lots = ref<Lot[]>([
//   {
//     id: 1,
//     numeroLot: 'LOT001',
//     boisson: { id: 1, nom: 'Coca-Cola' },
//     quantiteInitiale: 100,
//     quantiteActuelle: 75,
//     dateEntree: new Date('2025-07-01'),
//     datePeremption: new Date('2025-12-31')
//   },
//   {
//     id: 2,
//     numeroLot: 'LOT002',
//     boisson: { id: 2, nom: 'Fanta' },
//     quantiteInitiale: 150,
//     quantiteActuelle: 150,
//     dateEntree: new Date('2025-07-13'),
//     datePeremption: new Date('2025-08-13')
//   }
// ])

// const lots = ref<Lot[]>([
//   {
//     id: 1,
//     numeroLot: 'LOT001',
//     boisson: { id: 1, nom: 'Coca-Cola' },
//     quantiteInitiale: 100,
//     quantiteActuelle: 75,
//     dateEntree: new Date('2025-07-01'),
//     datePeremption: new Date('2025-12-31')
//   },
//   {
//     id: 2,
//     numeroLot: 'LOT002',
//     boisson: { id: 2, nom: 'Fanta' },
//     quantiteInitiale: 150,
//     quantiteActuelle: 150,
//     dateEntree: new Date('2025-07-13'),
//     datePeremption: new Date('2025-08-13')
//   }
// ])
const lots = ref<Lot[]>([])

// Chargement des données
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
// Filtres disponibles
  selectedLot.value = { ...lot }
  modalTitle.value = 'Modifier le lot'
  showModal.value = true
}

// Chargement des données
// Lots filtrés et triés
onMounted(async () => {
  try {
    lots.value = await inventaireService.getAllLots();
  // Filtre par recherche
  } catch (error) {
    console.error('Erreur lors du chargement des lots:', error);
  } finally {
    isLoading.value = false;
  }
});

  // Filtre par statut
const isLoading = ref(true);
const searchTerm = ref('');
const selectedFilter = ref('all');
const sortBy = ref('id');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Tous les lots' },
  { value: 'valid', label: 'Valides' },
  { value: 'expired', label: 'Périmés' },
];

// Lots filtrés et triés
  // Tri
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
// Fonction de tri
      }
    });
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Lot];
    const bValue = b[sortBy.value as keyof Lot];

// Formatage de la date
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc'
          ? aValue - bValue
// Vérifie si la date est proche de l'expiration
          : bValue - aValue;
    }

    return 0;
  });

  return filtered;
// Récupère le statut d'un lot
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
// Récupère la classe CSS du statut d'un lot
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Vérifie si la date est proche de l'expiration
// Soumet le formulaire (ajout ou modification d'un lot)
const isNearExpiration = (date: Date) => {
  const today = new Date()
    // Met à jour un lot existant
  const expirationDate = new Date(date)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return expirationDate.getTime() - today.getTime() <= thirtyDays
}

    // Ajoute un nouveau lot
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

const handleDelete = async (lot: Lot) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le lot ${lot.numeroLot} ?`)) return;
  try {
    isLoading.value = true;
    await inventaireService.deleteLot(lot.id);
    lots.value = await inventaireService.getAllLots();
  } catch (error) {
    console.error('Erreur lors de la suppression du lot:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="lots-container">
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
          <th @click="handleSort('id')" class="sortable-header" :class="{ 'sorted': sortBy === 'id' }">ID</th>
          <th @click="handleSort('numeroLot')" class="sortable-header" :class="{ 'sorted': sortBy === 'numeroLot' }">Numéro</th>
          <th>Boisson</th>
          <th>Quantité</th>
          <th>Fournisseur</th>
          <th @click="handleSort('datePeremption')" class="sortable-header" :class="{ 'sorted': sortBy === 'datePeremption' }">Date de Péremption</th>
          <th>Statut</th>
          <th class="actions-header">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="lot in filteredLots" :key="lot.id" class="table-row">
          <td class="id-cell">{{ lot.id }}</td>
          <td class="name-cell">{{ lot.numeroLot }}</td>
          <td class="name-cell">{{ lot.boisson.nom }}</td>
          <td class="name-cell">{{ lot.quantiteActuelle }}</td>
          <td class="name-cell">{{ lot.fournisseur?.nom || 'Non renseigné' }}</td>
          <td class="date-cell">
            <span class="date-value">{{ formatDate(lot.datePeremption) }}</span>
          </td>
          <td>
            <span :class="['status-badge', getLotStatusClass(lot)]">{{ getLotStatus(lot) }}</span>
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button @click="editLot(lot)" class="action-btn action-btn-edit" title="Modifier">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="handleDelete(lot)" class="action-btn action-btn-delete" title="Supprimer">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <Modal :model-value="showModal" :title="modalTitle" @update:modelValue="showModal = $event">
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
.lots-container {
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
.status-expired {
  background: #ea4335;
}
.status-empty {
  background: #fbbc04;
  color: #333;
}
.status-warning {
  background: #fbbc04;
  color: #333;
}
.status-available {
  background: #34a853;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.action-btn-edit {
  background: #e3f0ff;
  color: #4285f4;
}
.action-btn-edit:hover {
  background: #d2e3fc;
}
.action-btn-delete {
  background: #fdecea;
  color: #ea4335;
}
.action-btn-delete:hover {
  background: #f9cfcf;
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
