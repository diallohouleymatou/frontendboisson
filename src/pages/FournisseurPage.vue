<template>
  <div class="fournisseur-page modern-container">
    <div class="table-header modern-header">
      <div class="header-left">
        <h2 class="table-title main-title">Gestion des Fournisseurs</h2>
        <p class="table-subtitle">{{ fournisseurs.length }} fournisseur(s) trouvé(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary btn-lg" @click="handleAddClick" :disabled="!isGerant">
          Ajouter
        </button>
      </div>
    </div>
    <div class="table-wrapper modern-table-wrapper">
      <div v-if="isLoading" class="loading-state modern-loading">
        <div class="loading-spinner"></div>
        <p>Chargement des fournisseurs...</p>
      </div>
      <div v-else-if="fournisseurs.length === 0" class="empty-state modern-empty">
        <p>Aucun fournisseur trouvé</p>
      </div>
      <table v-else class="modern-table">
        <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Téléphone</th>
          <th>Adresse</th>
          <th>Statut</th>
          <th v-if="isGerant">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="f in fournisseurs" :key="f.id" class="modern-row">
          <td>{{ f.nom }}</td>
          <td>{{ f.email }}</td>
          <td>{{ f.telephone }}</td>
          <td>{{ f.adresse }}</td>
          <td>
            <span :class="['status-badge', f.isActive ? 'active' : 'inactive']">
              {{ f.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td v-if="isGerant">
            <button class="btn btn-icon btn-toggle" @click="handleToggleActive(f)">
              {{ f.isActive ? 'Désactiver' : 'Activer' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <Modal :modelValue="showModal" @update:modelValue="showModal = $event" :title="modalTitle" @close="closeModal">
      <template #title>{{ modalTitle }}</template>
      <FournisseurForm @submit="handleFournisseurCreated" @cancel="closeModal" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FournisseurService } from '../features/fournisseur/services/fournisseurService';
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService';
import { ElMessage } from 'element-plus';
import Modal from '../components/Modal.vue';
import FournisseurForm from '../components/forms/FournisseurForm.vue';

const fournisseurs = ref<any[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const modalTitle = ref('');

const currentUser = computed(() => UtilisateurService.getCurrentUser());
const isGerant = computed(() => currentUser.value?.role === 'GERANT');

const fetchFournisseurs = async () => {
  isLoading.value = true;
  try {
    fournisseurs.value = await FournisseurService.getAllFournisseurs();
  } catch (e) {
    ElMessage.error('Erreur lors du chargement des fournisseurs');
  } finally {
    isLoading.value = false;
  }
};

const handleToggleActive = async (f: any) => {
  if (!isGerant.value) return;
  try {
    const updated = await FournisseurService.activateOrDeactivateFournisseur(f.id, !f.isActive);
    const idx = fournisseurs.value.findIndex(x => x.id === f.id);
    if (idx !== -1) fournisseurs.value[idx] = updated;
    ElMessage.success(`Fournisseur ${updated.isActive ? 'activé' : 'désactivé'} avec succès !`);
  } catch (e) {
    ElMessage.error('Erreur lors du changement de statut');
  }
};

const handleAddClick = () => {
  if (!isGerant.value) {
    ElMessage.warning("Vous n'avez pas le droit d'ajouter un fournisseur.");
    return;
  }
  modalTitle.value = 'Ajouter un fournisseur';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleFournisseurCreated = (fournisseur: any) => {
  fournisseurs.value.push(fournisseur);
  closeModal();
};

onMounted(fetchFournisseurs);
</script>

<style scoped>
.fournisseur-page {
  padding: 20px;
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

.modern-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.modern-row {
  transition: all var(--transition-fast);
}

.modern-row:hover {
  background: var(--color-bg-secondary);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.active {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.status-badge.inactive {
  background: var(--color-error-50);
  color: var(--color-error-700);
}

.btn {
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

.btn-toggle {
  color: #388e3c;
}

.btn[disabled], .btn-icon[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: var(--space-4);
  }
  .table-wrapper {
    overflow-x: auto;
  }
  .modern-table {
    min-width: 800px;
  }
}
</style>
