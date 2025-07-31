<template>
  <form @submit.prevent="handleSubmit" class="entree-batch-form">
    <div class="form-header">
      <h3 class="form-title">Entrée par Lot - Traitement Groupé</h3>
      <p class="form-description">Créer plusieurs lots simultanément pour un traitement efficace</p>
    </div>

    <!-- Section Utilisateur -->
    <!-- Utilisateur connecté automatiquement, pas de sélection manuelle -->

    <!-- Liste des lots -->
    <div class="form-section">
      <div class="section-header">
        <h4 class="section-title">Lots à Créer ({{ lots.length }})</h4>
        <button type="button" @click="addLot" class="btn btn-outline">
          <PlusIcon class="w-4 h-4" />
          Ajouter un lot
        </button>
      </div>
      <div v-if="lots.length === 0" class="empty-lots">
        <div class="empty-icon">
          <ArchiveBoxIcon class="w-8 h-8" />
        </div>
        <p>Aucun lot ajouté. Cliquez sur "Ajouter un lot" pour commencer.</p>
      </div>
      <div v-else class="lots-list">
        <div v-for="(lot, index) in lots" :key="index" class="lot-card">
          <div class="lot-header">
            <h5 class="lot-title">Lot #{{ index + 1 }}</h5>
            <button type="button" @click="removeLot(index)" class="btn-remove">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
          <div class="lot-content">
            <div class="form-row">
              <div class="form-group">
                <label>Boisson*</label>
                <select
                    v-model="lot.boisson"
                    required
                    :class="{ 'error': lotErrors[index]?.boisson }"
                    @change="generateLotNumber(lot, index)"
                >
                  <option value="">Sélectionnez une boisson</option>
                  <option v-for="boisson in boissons" :key="boisson.id" :value="boisson">
                    {{ boisson.nom }} - {{ boisson.format }} {{ boisson.volume }}
                  </option>
                </select>
                <span v-if="lotErrors[index]?.boisson" class="error-message">{{ lotErrors[index].boisson }}</span>
              </div>
              <div class="form-group">
                <label>Numéro de lot*</label>
                <input
                    v-model="lot.numeroLot"
                    type="text"
                    required
                    :class="{ 'error': lotErrors[index]?.numeroLot }"
                    placeholder="Ex: LOT-2024-001"
                />
                <span v-if="lotErrors[index]?.numeroLot" class="error-message">{{ lotErrors[index].numeroLot }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quantité*</label>
                <input
                    v-model.number="lot.quantiteInitiale"
                    type="number"
                    min="1"
                    required
                    :class="{ 'error': lotErrors[index]?.quantiteInitiale }"
                    placeholder="Nombre d'unités"
                />
                <span v-if="lotErrors[index]?.quantiteInitiale" class="error-message">{{ lotErrors[index].quantiteInitiale }}</span>
              </div>
              <div class="form-group">
                <label>Date de péremption*</label>
                <input
                    v-model="lot.datePeremption"
                    type="date"
                    required
                    :class="{ 'error': lotErrors[index]?.datePeremption }"
                />
                <span v-if="lotErrors[index]?.datePeremption" class="error-message">{{ lotErrors[index].datePeremption }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Fournisseur*</label>
                <select
                    v-model="lot.fournisseur"
                    required
                    :class="{ 'error': lotErrors[index]?.fournisseur }"
                >
                  <option value="">Sélectionnez un fournisseur</option>
                  <option v-for="fournisseur in fournisseurs" :key="fournisseur.id" :value="fournisseur.id">
                    {{ fournisseur.nom }}
                  </option>
                </select>
                <span v-if="lotErrors[index]?.fournisseur" class="error-message">{{ lotErrors[index].fournisseur }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-checkbox">
                <label class="checkbox-label">
                  <input
                      type="checkbox"
                      v-model="lot.vendable"
                      class="checkbox-input"
                  />
                  <span class="checkbox-text">Produit vendable</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé -->
    <div v-if="lots.length > 0" class="form-summary">
      <h4 class="summary-title">Résumé du Traitement Groupé</h4>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Nombre de lots :</span>
          <span class="stat-value">{{ lots.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Quantité totale :</span>
          <span class="stat-value">{{ totalQuantity }} unités</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Boissons différentes :</span>
          <span class="stat-value">{{ uniqueBoissons }}</span>
        </div>
      </div>

      <div class="summary-preview">
        <h5>Aperçu des lots :</h5>
        <div class="lots-preview">
          <div v-for="(lot, index) in lots.slice(0, 3)" :key="index" class="preview-item">
            <span class="preview-boisson">{{ lot.boisson?.nom || 'Non définie' }}</span>
            <span class="preview-quantity">{{ lot.quantiteInitiale || 0 }} unités</span>
          </div>
          <div v-if="lots.length > 3" class="preview-more">
            +{{ lots.length - 3 }} autre(s) lot(s)
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Traitement en cours...' : `Créer ${lots.length} lot(s)` }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, TrashIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline'
import type { Lot } from '../../features/inventaire/models/lot'
import type { Boisson } from '../../features/boissons/models/boisson'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'
import { BoissonService } from '../../features/boissons/services/boissonService'
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateurService'
import { FournisseurService } from '../../features/fournisseur/services/fournisseurService'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: { lots: any[], utilisateur: Utilisateur }]
  cancel: []
}>()

// État du formulaire
const lots = ref<Partial<Lot>[]>([])
const selectedUtilisateur = ref<Utilisateur>()
const errors = ref<Record<string, string>>({})
const lotErrors = ref<Record<number, Record<string, string>>>({})

// Données de référence
const boissons = ref<Boisson[]>([])
const fournisseurs = ref<any[]>([])

// Chargement des données
onMounted(async () => {
  try {
    const [boissonsList, fournisseursList] = await Promise.all([
      BoissonService.getAllBoissons(),
      FournisseurService.getAllFournisseurs(),
    ])
    boissons.value = boissonsList
    fournisseurs.value = fournisseursList.filter(f => f.estActif)
    // Utilisateur connecté depuis localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      selectedUtilisateur.value = JSON.parse(userStr)
    }
    // Ajouter un premier lot par défaut
    addLot()
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

// Statistiques calculées
const totalQuantity = computed(() =>
    lots.value.reduce((sum, lot) => sum + (lot.quantiteInitiale || 0), 0)
)

const uniqueBoissons = computed(() => {
  const boissonIds = new Set(
      lots.value
          .filter(lot => lot.boisson?.id)
          .map(lot => lot.boisson!.id)
  )
  return boissonIds.size
})

// Validation
const isFormValid = computed(() => {
  return selectedUtilisateur.value &&
      lots.value.length > 0 &&
      lots.value.every(lot =>
          lot.boisson &&
          lot.numeroLot &&
          lot.quantiteInitiale &&
          lot.quantiteInitiale > 0 &&
          lot.datePeremption &&
          lot.fournisseur
      ) &&
      Object.keys(errors.value).length === 0 &&
      Object.keys(lotErrors.value).length === 0
})

// Gestion des lots
const addLot = () => {
  lots.value.push({
    numeroLot: '',
    quantiteInitiale: 0,
    quantiteActuelle: 0,
    datePeremption: '',
    vendable: true,
    fournisseur: '',
    boisson: undefined,
  })
}

const removeLot = (index: number) => {
  lots.value.splice(index, 1)
  delete lotErrors.value[index]

  // Réorganiser les erreurs
  const newLotErrors: Record<number, Record<string, string>> = {}
  Object.keys(lotErrors.value).forEach(key => {
    const oldIndex = parseInt(key)
    if (oldIndex > index) {
      newLotErrors[oldIndex - 1] = lotErrors.value[oldIndex]
    } else if (oldIndex < index) {
      newLotErrors[oldIndex] = lotErrors.value[oldIndex]
    }
  })
  lotErrors.value = newLotErrors
}

const generateLotNumber = (lot: Partial<Lot>, index: number) => {
  if (!lot.numeroLot && lot.boisson) {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    lot.numeroLot = `LOT-${dateStr}-${randomNum}-${index + 1}`
  }
}

// Validation
const validateForm = () => {
  errors.value = {}
  lotErrors.value = {}

  if (!selectedUtilisateur.value) {
    errors.value.utilisateur = 'Utilisateur non connecté'
  }

  if (lots.value.length === 0) {
    errors.value.lots = 'Ajoutez au moins un lot'
    return false
  }

  lots.value.forEach((lot, index) => {
    const lotError: Record<string, string> = {}
    if (!lot.boisson) {
      lotError.boisson = 'Veuillez sélectionner une boisson'
    }
    if (!lot.numeroLot) {
      lotError.numeroLot = 'Le numéro de lot est obligatoire'
    }
    if (!lot.quantiteInitiale || lot.quantiteInitiale <= 0) {
      lotError.quantiteInitiale = 'La quantité doit être supérieure à 0'
    }
    if (!lot.datePeremption) {
      lotError.datePeremption = 'La date de péremption est obligatoire'
    }
    if (!lot.fournisseur) {
      lotError.fournisseur = 'Veuillez sélectionner un fournisseur'
    }
    if (lot.datePeremption) {
      const datePeremption = new Date(lot.datePeremption)
      if (datePeremption <= new Date()) {
        lotError.datePeremption = 'La date de péremption doit être postérieure à la date actuelle'
      }
    }
    if (Object.keys(lotError).length > 0) {
      lotErrors.value[index] = lotError
    }
  })
  // Vérifier les numéros de lots dupliqués
  const numeroLots = lots.value.map(lot => lot.numeroLot).filter(Boolean)
  const duplicates = numeroLots.filter((item, index) => numeroLots.indexOf(item) !== index)
  if (duplicates.length > 0) {
    lots.value.forEach((lot, index) => {
      if (lot.numeroLot && duplicates.includes(lot.numeroLot)) {
        if (!lotErrors.value[index]) lotErrors.value[index] = {}
        lotErrors.value[index].numeroLot = 'Ce numéro de lot est déjà utilisé'
      }
    })
  }
  return Object.keys(errors.value).length === 0 && Object.keys(lotErrors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }
  // Mapping strict pour chaque lot (LotDto) avec objets complets pour boisson et fournisseur
  const lotsToSend = lots.value.map(lot => ({
    numeroLot: lot.numeroLot,
    quantiteInitiale: lot.quantiteInitiale,
    quantiteActuelle: lot.quantiteInitiale,
    datePeremption: lot.datePeremption,
    vendable: lot.vendable,
    boisson: lot.boisson, // objet complet
    fournisseur: fournisseurs.find(f => f.id === lot.fournisseur), // objet complet
  }))
  // Mapping strict pour l'utilisateur (UtilisateurDto)
  const user = selectedUtilisateur.value
      ? {
        id: selectedUtilisateur.value.id,
        firstName: selectedUtilisateur.value.firstName,
        lastName: selectedUtilisateur.value.lastName,
        email: selectedUtilisateur.value.email,
        role: selectedUtilisateur.value.role,
        isActive: selectedUtilisateur.value.isActive,
        isFirstLogin: selectedUtilisateur.value.isFirstLogin,
      }
      : undefined
  emit('submit', {
    lots: lotsToSend,
    utilisateur: user,
  })
}
</script>

<style scoped>
.entree-batch-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-checkbox {
  justify-content: center;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
  margin-bottom: 0;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Lots */
.empty-lots {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 1rem;
  color: #9ca3af;
}

.lots-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lot-card {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.lot-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
}

.btn-remove {
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}

/* Résumé */
.form-summary {
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: 500;
  color: #374151;
}

.stat-value {
  font-weight: 600;
  color: #1e40af;
}

.summary-preview h5 {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.lots-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.preview-boisson {
  color: #374151;
}

.preview-quantity {
  color: #1e40af;
  font-weight: 500;
}

.preview-more {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

/* Boutons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #1e40af;
  border: 1px solid #1e40af;
}

.btn-outline:hover:not(:disabled) {
  background: #eff6ff;
}

.btn-primary {
  background: #1e40af;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3a8a;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>