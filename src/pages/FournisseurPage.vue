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
</style>
