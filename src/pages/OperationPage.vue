<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import type { LigneOperation } from "../features/inventaire/models/ligneOperation.ts";
import { inventaireService } from "../features/inventaire/services/inventaireService";
import Modal from '../components/Modal.vue'

const operations = ref<LigneOperation[]>([])
const showModal = ref(false)
const modalTitle = ref('')
const selectedOperation = ref<LigneOperation | null>(null)

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
    const response = await inventaireService.getAllLigneOperations();
    // Le backend retourne une structure paginée
    operations.value = response.data || response;
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
    let aValue: any;
    let bValue: any;

    if (sortBy.value === 'id') {
      aValue = a.id;
      bValue = b.id;
    } else if (sortBy.value === 'quantite') {
      aValue = a.quantite;
      bValue = b.quantite;
    } else {
      // Pour les autres champs, on ne fait pas de tri
      return 0;
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
  <div class="operations-page">
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
                  class="action-btn action-btn-view"
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
    <Modal :modelValue="showModal" :title="modalTitle" @update:modelValue="closeModal">
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
              <span>{{ selectedOperation.mouvement.utilisateur.email }}</span>
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
    </Modal>
  </div>
</template>

<style scoped>
/* Import du système de design */
@import url('../style.css');

.operations-page {
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
  width: 16px;
  height: 16px;
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
  width: 16px;
  height: 16px;
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
  padding: var(--space-4);
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

.quantity-cell,
.lot-cell,
.boisson-cell {
  padding: var(--space-4);
  font-weight: var(--font-weight-medium);
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

.action-btn-view {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.action-btn-view:hover {
  background: var(--color-primary-100);
}

/* Détails de l'opération */
.operation-details {
  padding: var(--space-4) 0;
}

.detail-section {
  margin-bottom: var(--space-6);
}

.detail-section h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--space-2);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-item label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.detail-item span {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.modal-actions {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
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

.btn-secondary {
  background: var(--color-secondary-500);
  color: var(--color-text-inverse);
}

.btn-secondary:hover {
  background: var(--color-secondary-600);
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