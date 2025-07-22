<template>
  <form @submit.prevent="handleSubmit" class="entree-form">
    <div class="form-header">
      <h3 class="form-title">Nouvelle Entrée de Stock</h3>
      <p class="form-description">Créer un nouveau lot et l'ajouter au stock</p>
    </div>

    <div class="form-sections">
      <!-- Section Boisson -->
      <div class="form-section">
        <h4 class="section-title">Informations Boisson</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="boisson">Boisson*</label>
            <select
              id="boisson"
              v-model="formData.lot.boisson"
              required
              :class="{ 'error': errors.boisson }"
              @change="onBoissonChange"
            >
              <option value="">Sélectionnez une boisson</option>
              <option v-for="boisson in boissons" :key="boisson.id" :value="boisson">
                {{ boisson.nom }} - {{ boisson.format }} {{ boisson.volume }}
              </option>
            </select>
            <span v-if="errors.boisson" class="error-message">{{ errors.boisson }}</span>
          </div>
        </div>
      </div>

      <!-- Section Lot -->
      <div class="form-section">
        <h4 class="section-title">Détails du Lot</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="numeroLot">Numéro de lot*</label>
            <input
              id="numeroLot"
              v-model="formData.lot.numeroLot"
              type="text"
              required
              :class="{ 'error': errors.numeroLot }"
              placeholder="Ex: LOT-2024-001"
            />
            <span v-if="errors.numeroLot" class="error-message">{{ errors.numeroLot }}</span>
          </div>
          <div class="form-group">
            <label for="quantiteInitiale">Quantité*</label>
            <input
              id="quantiteInitiale"
              v-model.number="formData.lot.quantiteInitiale"
              type="number"
              min="1"
              required
              :class="{ 'error': errors.quantiteInitiale }"
              placeholder="Nombre d'unités"
            />
            <span v-if="errors.quantiteInitiale" class="error-message">{{ errors.quantiteInitiale }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dateEntree">Date d'entrée*</label>
            <input
              id="dateEntree"
              v-model="formData.lot.dateEntree"
              type="datetime-local"
              required
              :class="{ 'error': errors.dateEntree }"
            />
            <span v-if="errors.dateEntree" class="error-message">{{ errors.dateEntree }}</span>
          </div>
          <div class="form-group">
            <label for="datePeremption">Date de péremption*</label>
            <input
              id="datePeremption"
              v-model="formData.lot.datePeremption"
              type="date"
              required
              :class="{ 'error': errors.datePeremption }"
            />
            <span v-if="errors.datePeremption" class="error-message">{{ errors.datePeremption }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="fournisseur">Fournisseur</label>
            <input
              id="fournisseur"
              v-model="formData.lot.fournisseur"
              type="text"
              placeholder="Nom du fournisseur"
            />
          </div>
          <div class="form-group form-group-checkbox">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.lot.vendable"
                class="checkbox-input"
              />
              <span class="checkbox-text">Produit vendable</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Section Utilisateur -->
      <div class="form-section">
        <h4 class="section-title">Utilisateur</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="utilisateur">Utilisateur responsable*</label>
            <select
              id="utilisateur"
              v-model="formData.utilisateur"
              required
              :class="{ 'error': errors.utilisateur }"
            >
              <option value="">Sélectionnez un utilisateur</option>
              <option v-for="utilisateur in utilisateurs" :key="utilisateur.id" :value="utilisateur">
                {{ utilisateur.nom }} ({{ utilisateur.email }})
              </option>
            </select>
            <span v-if="errors.utilisateur" class="error-message">{{ errors.utilisateur }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé -->
    <div v-if="formData.lot.boisson && formData.lot.quantiteInitiale" class="form-summary">
      <h4 class="summary-title">Résumé de l'entrée</h4>
      <div class="summary-content">
        <div class="summary-item">
          <span class="summary-label">Boisson :</span>
          <span class="summary-value">{{ formData.lot.boisson.nom }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Quantité :</span>
          <span class="summary-value">{{ formData.lot.quantiteInitiale }} unités</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Numéro de lot :</span>
          <span class="summary-value">{{ formData.lot.numeroLot }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Impact stock :</span>
          <span class="summary-value positive">+{{ formData.lot.quantiteInitiale }} en stock</span>
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
        {{ isLoading ? 'Création en cours...' : 'Créer l\'entrée' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CreateLotRequest } from '../../features/inventaire/models/createLotRequest'
import type { Lot } from '../../features/inventaire/models/lot'
import type { Boisson } from '../../features/boissons/models/boisson'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'
import { BoissonService } from '../../features/boissons/services/boissonService'
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateurService'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateLotRequest]
  cancel: []
}>()

// État du formulaire
const formData = ref<CreateLotRequest>({
  lot: {
    numeroLot: '',
    quantiteInitiale: 0,
    quantiteActuelle: 0,
    dateEntree: new Date().toISOString().slice(0, 16),
    datePeremption: '',
    vendable: true,
    fournisseur: '',
    boisson: undefined,
  } as Lot,
  utilisateur: undefined as Utilisateur | undefined,
})

const errors = ref<Record<string, string>>({})

// Données de référence
const boissons = ref<Boisson[]>([])
const utilisateurs = ref<Utilisateur[]>([])

// Chargement des données
onMounted(async () => {
  try {
    const [boissonsList, utilisateursList] = await Promise.all([
      BoissonService.getAllBoissons(),
      UtilisateurService.getAllUtilisateurs(),
    ])
    boissons.value = boissonsList
    utilisateurs.value = utilisateursList
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

// Validation
const isFormValid = computed(() => {
  return formData.value.lot.boisson &&
         formData.value.lot.numeroLot &&
         formData.value.lot.quantiteInitiale > 0 &&
         formData.value.lot.dateEntree &&
         formData.value.lot.datePeremption &&
         formData.value.utilisateur &&
         Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}

  if (!formData.value.lot.boisson) {
    errors.value.boisson = 'Veuillez sélectionner une boisson'
  }

  if (!formData.value.lot.numeroLot) {
    errors.value.numeroLot = 'Le numéro de lot est obligatoire'
  }

  if (!formData.value.lot.quantiteInitiale || formData.value.lot.quantiteInitiale <= 0) {
    errors.value.quantiteInitiale = 'La quantité doit être supérieure à 0'
  }

  if (!formData.value.lot.dateEntree) {
    errors.value.dateEntree = 'La date d\'entrée est obligatoire'
  }

  if (!formData.value.lot.datePeremption) {
    errors.value.datePeremption = 'La date de péremption est obligatoire'
  }

  if (!formData.value.utilisateur) {
    errors.value.utilisateur = 'Veuillez sélectionner un utilisateur'
  }

  // Validation de cohérence des dates
  if (formData.value.lot.dateEntree && formData.value.lot.datePeremption) {
    const dateEntree = new Date(formData.value.lot.dateEntree)
    const datePeremption = new Date(formData.value.lot.datePeremption)

    if (datePeremption <= dateEntree) {
      errors.value.datePeremption = 'La date de péremption doit être postérieure à la date d\'entrée'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Gestionnaires d'événements
const onBoissonChange = () => {
  // Générer automatiquement un numéro de lot si vide
  if (!formData.value.lot.numeroLot && formData.value.lot.boisson) {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    formData.value.lot.numeroLot = `LOT-${dateStr}-${randomNum}`
  }
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // Définir la quantité actuelle = quantité initiale pour une nouvelle entrée
  formData.value.lot.quantiteActuelle = formData.value.lot.quantiteInitiale

  emit('submit', {
    lot: { ...formData.value.lot },
    utilisateur: formData.value.utilisateur!,
  })
}
</script>

<style scoped>
.entree-form {
  max-width: 800px;
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
  color: #166534;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
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

/* Résumé */
.form-summary {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 1rem;
}

.summary-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: #374151;
}

.summary-value {
  font-weight: 600;
  color: #1f2937;
}

.summary-value.positive {
  color: #059669;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #22c55e;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #16a34a;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
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

  .summary-content {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
