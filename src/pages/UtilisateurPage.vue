<template>
  <div class="utilisateur-page container">
    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div class="header-left">
        <h2 class="table-title" style="margin: 0; color: #333;">Gestion des Utilisateurs</h2>
        <p class="table-subtitle" style="color: #666;">{{ filteredUtilisateurs.length }} utilisateur(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal">
          <PlusIcon class="w-4 h-4" style="margin-right: 6px;" />
          Nouvel utilisateur
        </button>
      </div>
    </div>
    <div class="filters-bar" style="display: flex; gap: 16px; margin-bottom: 20px;">
      <div class="search-container" style="flex: 1; display: flex; align-items: center; background: #f2f2f2; border-radius: 8px; padding: 6px 12px;">
        <MagnifyingGlassIcon class="search-icon" style="margin-right: 8px; color: #888;" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher un utilisateur..."
          class="search-input"
          style="border: none; background: transparent; outline: none; width: 100%;"
        />
      </div>
      <div class="filter-container" style="display: flex; align-items: center; background: #f2f2f2; border-radius: 8px; padding: 6px 12px;">
        <FunnelIcon class="filter-icon" style="margin-right: 8px; color: #888;" />
        <select v-model="selectedFilter" class="filter-select" style="border: none; background: transparent; outline: none;">
          <option v-for="filter in filters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state" style="text-align: center; padding: 40px 0;">
        <div class="loading-spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
      <div v-else-if="filteredUtilisateurs.length === 0" class="empty-state" style="text-align: center; color: #888; padding: 40px 0;">
        <p>Aucun utilisateur trouvé</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilisateur in filteredUtilisateurs" :key="utilisateur.id">
            <td>{{ utilisateur.lastName }}</td>
            <td>{{ utilisateur.email }}</td>
            <td>{{ utilisateur.role }}</td>
            <td>
              <span :style="{ color: utilisateur.isActive ? '#34a853' : '#ea4335', fontWeight: 'bold' }">
                {{ utilisateur.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td>
              <button
                class="btn"
                :class="utilisateur.isActive ? 'btn-danger' : 'btn-primary'"
                @click="handleToggleActive(utilisateur)"
                style="margin-right: 8px; transition: background 0.2s, color 0.2s;"
              >
                {{ utilisateur.isActive ? 'Désactiver' : 'Activer' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Modal :model-value="showModal" :title="modalTitle" @update:modelValue="showModal = $event">
      <UtilisateurForm :utilisateur="selectedUtilisateur" @submit="handleSubmit" @cancel="closeModal" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import Modal from '../components/Modal.vue'
import UtilisateurForm from '../components/forms/UtilisateurForm.vue'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import type { Utilisateur } from '../features/utilisateurs/models/utilisateur'

const utilisateurs = ref<Utilisateur[]>([])

const filters = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'GERANT', label: 'Gérants' },
  { value: 'EMPLOYE', label: 'Employés' },
  { value: 'LIVREUR', label: 'Livreurs' }
]

const isLoading = ref(false)
const searchTerm = ref('')
const selectedFilter = ref('all')
const sortBy = ref('email')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showModal = ref(false)
const modalTitle = ref('Nouvel utilisateur')
const selectedUtilisateur = ref<Utilisateur | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const response = await UtilisateurService.getAllUtilisateurs()
    utilisateurs.value = response
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredUtilisateurs = computed(() => {
  let filtered = utilisateurs.value
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.email.toLowerCase().includes(search)
    )
  }
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedFilter.value)
  }
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Utilisateur]
    const bValue = b[sortBy.value as keyof Utilisateur]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    return 0
  })
  return filtered
})

const currentUser = computed(() => UtilisateurService.getCurrentUser());
const isGerant = computed(() => currentUser.value?.role === 'GERANT');



const openModal = () => {
  selectedUtilisateur.value = null
  modalTitle.value = 'Nouvel utilisateur'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUtilisateur.value = null
}

const handleSubmit = async (data: any) => {
  try {
    isLoading.value = true
    await UtilisateurService.createUtilisateur(data)
    closeModal()
    utilisateurs.value = await UtilisateurService.getAllUtilisateurs()
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

const handleToggleActive = async (utilisateur: Utilisateur) => {
  if (!isGerant.value) return;
  try {
    isLoading.value = true;
    await UtilisateurService.toggleUtilisateurStatut(utilisateur.id, !utilisateur.isActive);
    utilisateurs.value = await UtilisateurService.getAllUtilisateurs();
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.utilisateur-page {
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
.btn-danger {
  background: #ea4335;
  color: #fff;
}
.btn-danger:hover {
  background: #c62828;
}
.btn-outline-primary {
  background: #fff;
  color: #4285f4;
  border: 1px solid #4285f4;
}
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
