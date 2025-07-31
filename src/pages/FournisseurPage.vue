<template>
  <div class="fournisseur-page">
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Fournisseurs</h2>
        <p class="table-subtitle">{{ fournisseurs.length }} fournisseur(s) trouvé(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="handleAddClick" :disabled="!isGerant">
          Ajouter
        </button>
      </div>
    </div>
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des fournisseurs...</p>
      </div>
      <div v-else-if="fournisseurs.length === 0" class="empty-state">
        <p>Aucun fournisseur trouvé</p>
      </div>
      <table v-else class="table">
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
        <tr v-for="f in fournisseurs" :key="f.id">
          <td>{{ f.nom }}</td>
          <td>{{ f.email }}</td>
          <td>{{ f.telephone }}</td>
          <td>{{ f.adresse }}</td>
          <td>
            <span :class="['status-badge', f.estActif ? 'status-active' : 'status-inactive']">
              {{ f.estActif ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td v-if="isGerant">
            <button class="btn btn-outline-secondary btn-sm" @click="handleToggleActive(f)">
              {{ f.estActif ? 'Désactiver' : 'Activer' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <Modal :model-value="showModal" :title="modalTitle" @update:modelValue="showModal = $event">
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
    const updated = await FournisseurService.toggleFournisseurStatut(f.id);
    const idx = fournisseurs.value.findIndex(x => x.id === f.id);
    if (idx !== -1) fournisseurs.value[idx] = updated;
    ElMessage.success(`Fournisseur ${updated.estActif ? 'activé' : 'désactivé'} avec succès !`);
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
.table-wrapper {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0;
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.table th, .table td {
  border: 1px solid #dee2e6;
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
}
.table th {
  background-color: #f8f9fa;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.table th.sorted {
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
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
