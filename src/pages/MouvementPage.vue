<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import type { Mouvement } from "../features/inventaire/models/mouvement.ts";
import { inventaireService } from "../features/inventaire/services/inventaireService";
import Modal from '../components/Modal.vue'
import MouvementForm from '../components/forms/MouvementForm.vue'

const mouvements = ref<Mouvement[]>([])
const showModal = ref(false)
const modalTitle = ref('')
const selectedMouvement = ref<Mouvement | null>(null)

function openModal(){
  modalTitle.value = 'Ajouter un mouvement'
  selectedMouvement.value = null
  showModal.value = true
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
</script>

<template>
  <div class="mouvements-container">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Mouvements</h2>
        <p class="table-subtitle">{{ filteredMouvements.length }} mouvement(s) trouvé(s)</p>
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
          <td class="quantity-cell">{{ mouvement.quantite }}</td>
          <td class="user-cell">{{ mouvement.utilisateur?.nom || '-' }}</td>
          <td class="reason-cell">{{ mouvement.raison || '-' }}</td>
          <td class="actions-cell">
            <div class="actions-group">
              <button
                  @click="editMouvement(mouvement)"
                  class="btn-icon btn-edit"
                  title="Modifier"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                  class="btn-icon btn-delete"
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
    <Modal :show="showModal" @close="closeModal">
      <template #header>
        <h3>{{ modalTitle }}</h3>
      </template>
      <template #body>
        <MouvementForm
            :mouvement="selectedMouvement"
            @submit="handleSubmit"
            @cancel="closeModal"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
@import url('../style.css');

.mouvements-container {
  padding: 2rem;
  max-width: 100%;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-entree {
  background-color: #dcfce7;
  color: #166534;
}

.type-sortie {
  background-color: #fef2f2;
  color: #dc2626;
}

.type-ajustement {
  background-color: #fef3c7;
  color: #d97706;
}

.quantity-cell,
.user-cell,
.reason-cell {
  padding: 1rem;
  font-weight: 500;
}
</style>
