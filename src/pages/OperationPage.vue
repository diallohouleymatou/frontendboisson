<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import type { LigneOperation } from "../features/inventaire/models/ligneOperation.ts";
import { inventaireService } from "../features/inventaire/services/inventaireService";
import Modal from '../components/Modal.vue'

const operations = ref<LigneOperation[]>([])
const showModal = ref(false)
const modalTitle = ref('')
const selectedOperation = ref<LigneOperation | null>(null)

function openModal(){
  modalTitle.value = 'Détails de l\'opération'
  showModal.value = true
};

const closeModal = () => {
  showModal.value = false
  selectedOperation.value = null
}

const viewOperation = (operation: LigneOperation) => {
  selectedOperation.value = { ...operation }
  modalTitle.value = 'Détails de l\'opération'
  showModal.value = true
}

// Chargement des données
onMounted(async () => {
  try {
    operations.value = await inventaireService.getAllLigneOperations();
  } catch (error) {
    console.error('Erreur lors du chargement des opérations:', error);
  } finally {
    isLoading.value = false;
  }
});

const isLoading = ref(true);
const searchTerm = ref('');
const selectedFilter = ref('all');
const sortBy = ref('id');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Toutes les opérations' },
  { value: 'ENTREE', label: 'Entrées' },
  { value: 'SORTIE', label: 'Sorties' },
  { value: 'AJUSTEMENT', label: 'Ajustements' },
];

// Opérations filtrées et triées
const filteredOperations = computed(() => {
  let filtered = operations.value;

  // Filtre par recherche
  if (searchTerm.value) {
    filtered = filtered.filter(operation =>
        (operation.lot?.numeroLot && operation.lot.numeroLot.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
        (operation.lot?.boisson?.nom && operation.lot.boisson.nom.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
        (operation.mouvement?.type && operation.mouvement.type.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
  }

  // Filtre par type de mouvement
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(operation => operation.mouvement?.type === selectedFilter.value);
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof LigneOperation];
    const bValue = b[sortBy.value as keyof LigneOperation];

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
</script>

<template>
  <div class="operations-container">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Ligne d'Opérations</h2>
        <p class="table-subtitle">{{ filteredOperations.length }} opération(s) trouvée(s)</p>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="filters-bar">
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher une opération..."
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
        <p>Chargement des opérations...</p>
      </div>

      <div v-else-if="filteredOperations.length === 0" class="empty-state">
        <p>Aucune opération trouvée</p>
      </div>

      <table v-else class="modern-table">
        <thead>
        <tr>
          <th
              v-for="column in [
                { key: 'id', label: 'ID Opération' },
                { key: 'mouvementId', label: 'ID Mouvement' },
                { key: 'type', label: 'Type' },
                { key: 'lotNumero', label: 'N° Lot' },
                { key: 'boisson', label: 'Boisson' },
                { key: 'quantite', label: 'Quantité' },
                { key: 'date', label: 'Date' },
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
            v-for="operation in filteredOperations"
            :key="operation.id"
            class="table-row"
        >
          <td class="id-cell">{{ operation.id }}</td>
          <td class="id-cell">{{ operation.mouvement?.id || '-' }}</td>
          <td class="type-cell">
            <span
              v-if="operation.mouvement?.type"
              class="type-badge"
              :class="getTypeClass(operation.mouvement.type)"
            >
              {{ operation.mouvement.type }}
            </span>
            <span v-else>-</span>
          </td>
          <td class="lot-cell">{{ operation.lot?.numeroLot || '-' }}</td>
          <td class="boisson-cell">{{ operation.lot?.boisson?.nom || '-' }}</td>
          <td class="quantity-cell">{{ operation.quantite }}</td>
          <td class="date-cell">
            <span v-if="operation.mouvement?.dateMouvement" class="date-value">
              {{ formatDate(operation.mouvement.dateMouvement) }}
            </span>
            <span v-else>-</span>
          </td>
          <td class="actions-cell">
            <div class="actions-group">
              <button
                  @click="viewOperation(operation)"
                  class="btn-icon btn-view"
                  title="Voir détails"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour voir les détails d'une opération -->
    <Modal :show="showModal" @close="closeModal">
      <template #header>
        <h3>{{ modalTitle }}</h3>
      </template>
      <template #body>
        <div v-if="selectedOperation" class="operation-details">
          <div class="detail-section">
            <h4>Informations de l'opération</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID Opération:</label>
                <span>{{ selectedOperation.id }}</span>
              </div>
              <div class="detail-item">
                <label>Quantité:</label>
                <span>{{ selectedOperation.quantite }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOperation.mouvement" class="detail-section">
            <h4>Informations du mouvement</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID Mouvement:</label>
                <span>{{ selectedOperation.mouvement.id }}</span>
              </div>
              <div class="detail-item">
                <label>Type:</label>
                <span
                  class="type-badge"
                  :class="getTypeClass(selectedOperation.mouvement.type)"
                >
                  {{ selectedOperation.mouvement.type }}
                </span>
              </div>
              <div class="detail-item">
                <label>Date:</label>
                <span>{{ formatDate(selectedOperation.mouvement.dateMouvement) }}</span>
              </div>
              <div class="detail-item" v-if="selectedOperation.mouvement.raison">
                <label>Raison:</label>
                <span>{{ selectedOperation.mouvement.raison }}</span>
              </div>
              <div class="detail-item" v-if="selectedOperation.mouvement.utilisateur">
                <label>Utilisateur:</label>
                <span>{{ selectedOperation.mouvement.utilisateur.nom }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedOperation.lot" class="detail-section">
            <h4>Informations du lot</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Numéro de lot:</label>
                <span>{{ selectedOperation.lot.numeroLot }}</span>
              </div>
              <div class="detail-item" v-if="selectedOperation.lot.boisson">
                <label>Boisson:</label>
                <span>{{ selectedOperation.lot.boisson.nom }}</span>
              </div>
              <div class="detail-item">
                <label>Quantité actuelle:</label>
                <span>{{ selectedOperation.lot.quantiteActuelle }}</span>
              </div>
              <div class="detail-item">
                <label>Date de péremption:</label>
                <span>{{ formatDate(selectedOperation.lot.datePeremption) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeModal">
              Fermer
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
@import url('../style.css');

.operations-container {
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
.lot-cell,
.boisson-cell {
  padding: 1rem;
  font-weight: 500;
}

.btn-view {
  background-color: #3b82f6;
  color: white;
}

.btn-view:hover {
  background-color: #2563eb;
}

.operation-details {
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-item span {
  color: #111827;
  font-weight: 500;
}

.modal-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}
</style>
