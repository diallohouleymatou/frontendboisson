<template>
  <div class="utilisateur-page">
    <div class="table-header">
      <div class="header-left">
        <h2 class="table-title">Gestion des Utilisateurs</h2>
        <p class="table-subtitle">{{ filteredUtilisateurs.length }} utilisateur(s)</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal">
          <PlusIcon class="w-4 h-4" />
          Nouvel utilisateur
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
          placeholder="Rechercher un utilisateur..."
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

    <!-- Tableau des utilisateurs -->
    <div class="table-wrapper">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>

      <div v-else-if="filteredUtilisateurs.length === 0" class="empty-state">
        <p>Aucun utilisateur trouvé</p>
      </div>

      <table v-else class="modern-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="handleSort(column.key)"
              class="sortable-header"
              :class="{ 'sorted': sortBy === column.key }"
            >
              {{ column.label }}
              <span class="sort-indicator" v-if="sortBy === column.key">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilisateur in filteredUtilisateurs" :key="utilisateur.id" class="table-row">
            <td>{{ utilisateur.email }}</td>
            <td>
              <span class="role-badge" :class="getRoleBadgeClass(utilisateur.role)">
                {{ getRoleLabel(utilisateur.role) }}
              </span>
            </td>
            <td>{{ formatDate(utilisateur.createdAt) }}</td>
            <td>
              <div class="actions-group">
                <button
                  @click="openChangePasswordModal(utilisateur)"
                  class="action-btn action-btn-password"
                  title="Changer le mot de passe"
                >
                  <KeyIcon class="w-4 h-4" />
                </button>
                <button
                  @click="handleDeleteUser(utilisateur)"
                  class="action-btn action-btn-delete"
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

    <!-- Modal pour nouvel utilisateur -->
    <Modal v-model="showModal" :title="modalTitle">
      <UtilisateurForm
        :utilisateur="selectedUtilisateur"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </Modal>

    <!-- Modal pour changement de mot de passe -->
    <Modal v-model="showPasswordModal" title="Changer le mot de passe">
      <PasswordForm
        :utilisateur="selectedUtilisateur"
        @submit="handlePasswordChange"
        @cancel="closePasswordModal"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'
import Modal from '../components/Modal.vue'
import UtilisateurForm from '../components/forms/UtilisateurForm.vue'
import PasswordForm from '../components/forms/PasswordForm.vue'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import type { Utilisateur } from '../features/utilisateurs/models/utilisateur'
import type { Role } from '../features/utilisateurs/models/role'

// Mock data for development
const utilisateurs = ref<Utilisateur[]>([
  {
    id: 1,
    email: 'gerant@example.com',
    role: 'GERANT' as Role,
    motDePasse: 'password123',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    email: 'employe@example.com',
    role: 'EMPLOYE' as Role,
    motDePasse: 'password123',
    isActive: true,
    createdAt: '2023-01-02T00:00:00.000Z'
  }
])

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rôle' },
  { key: 'createdAt', label: 'Date de création' }
]

const filters = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'GERANT', label: 'Gérants' },
  { value: 'EMPLOYE', label: 'Employés' },
  { value: 'LIVREUR', label: 'Livreurs' }
]

// State
const isLoading = ref(false)
const searchTerm = ref('')
const selectedFilter = ref('all')
const sortBy = ref('email')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showModal = ref(false)
const showPasswordModal = ref(false)
const modalTitle = ref('Nouvel utilisateur')
const selectedUtilisateur = ref<Utilisateur | null>(null)

// Load initial data
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

// Computed
const filteredUtilisateurs = computed(() => {
  let filtered = utilisateurs.value

  // Filter by search term
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.email.toLowerCase().includes(search)
    )
  }

  // Filter by role
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Utilisateur]
    const bValue = b[sortBy.value as keyof Utilisateur]

    if (sortBy.value === 'createdAt') {
      return sortOrder.value === 'asc'
        ? new Date(aValue as Date).getTime() - new Date(bValue as Date).getTime()
        : new Date(bValue as Date).getTime() - new Date(aValue as Date).getTime()
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return 0
  })

  return filtered
})

// Methods
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getRoleLabel = (role: Role) => {
  switch (role) {
    case 'GERANT':
      return 'Gérant'
    case 'EMPLOYE':
      return 'Employé'
    case 'LIVREUR':
      return 'Livreur'
    default:
      return role
  }
}

const getRoleBadgeClass = (role: Role) => {
  switch (role) {
    case 'GERANT':
      return 'role-gerant'
    case 'EMPLOYE':
      return 'role-employe'
    case 'LIVREUR':
      return 'role-livreur'
    default:
      return ''
  }
}

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const openModal = () => {
  selectedUtilisateur.value = null
  modalTitle.value = 'Nouvel utilisateur'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUtilisateur.value = null
}

const openChangePasswordModal = (utilisateur: Utilisateur) => {
  selectedUtilisateur.value = utilisateur
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  selectedUtilisateur.value = null
}

const handleSubmit = async (data: any) => {
  try {
    isLoading.value = true
    await UtilisateurService.createUtilisateur(data)
    closeModal()
    // Reload users
    utilisateurs.value = await UtilisateurService.getAllUtilisateurs()
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

const handlePasswordChange = async (data: any) => {
  try {
    isLoading.value = true
    await UtilisateurService.changePassword(selectedUtilisateur.value!.id, data)
    closePasswordModal()
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDeleteUser = async (utilisateur: Utilisateur) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${utilisateur.email} ?`)) {
    return
  }

  try {
    isLoading.value = true
    await UtilisateurService.deleteUtilisateur(utilisateur.id)
    // Reload users
    utilisateurs.value = await UtilisateurService.getAllUtilisateurs()
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.utilisateur-page {
  padding: 20px;
}

/* Header styles */
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

.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--glow-primary);
}

/* Filter styles */
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

/* Table wrapper */
.table-wrapper {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

/* Table styles */
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

/* Role badges */
.role-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.role-gerant {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.role-employe {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.role-livreur {
  background: var(--color-info-50);
  color: var(--color-info-700);
}

/* Action buttons */
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

.action-btn-password {
  background: var(--color-warning-50);
  color: var(--color-warning-500);
}

.action-btn-password:hover {
  background: var(--color-warning-100);
}

.action-btn-delete {
  background: var(--color-error-50);
  color: var(--color-error-500);
}

.action-btn-delete:hover {
  background: var(--color-error-100);
}

/* Loading and empty states */
.loading-state,
.empty-state {
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
    min-width: 600px;
  }
}
</style>
