<template>
  <form @submit.prevent="handleSubmit" class="sortie-form">
    <div class="form-header">
      <h3 class="form-title">Sortie de Stock</h3>
      <p class="form-description">Retirer des produits du stock existant</p>
    </div>

    <div class="form-sections">
      <!-- Section Sélection de la boisson -->
      <div class="form-section">
        <h4 class="section-title">Sélection de la Boisson</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="boissonId">Boisson à sortir*</label>
            <select
              id="boissonId"
              v-model="formData.boissonId"
              required
              :class="{ 'error': errors.boissonId }"
              @change="onBoissonChange"
            >
              <option value="">Sélectionnez une boisson</option>
              <option v-for="boisson in boissons" :key="boisson.id" :value="boisson.id">
                {{ boisson.nom }} - {{ boisson.volume }}{{ boisson.unite }}
              </option>
            </select>
            <span v-if="errors.boissonId" class="error-message">{{ errors.boissonId }}</span>
          </div>
        </div>
      </div>

      <!-- Détails de la boisson sélectionnée -->
      <div v-if="selectedBoissonDetails" class="form-section boisson-details">
        <h4 class="section-title">Détails de la Boisson Sélectionnée</h4>
        <div class="boisson-info-grid">
          <div class="info-item">
            <span class="info-label">Nom :</span>
            <span class="info-value">{{ selectedBoissonDetails.nom }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Volume :</span>
            <span class="info-value">{{ selectedBoissonDetails.volume }}{{ selectedBoissonDetails.unite }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Description :</span>
            <span class="info-value">{{ selectedBoissonDetails.description || 'Non spécifiée' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Type :</span>
            <span class="info-value">{{ selectedBoissonDetails.type || 'Non spécifié' }}</span>
          </div>
        </div>
      </div>

      <!-- Section Sortie -->
      <div class="form-section">
        <h4 class="section-title">Détails de la Sortie</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="quantiteDemandee">Quantité demandée*</label>
            <input
              id="quantiteDemandee"
              v-model.number="formData.quantiteDemandee"
              type="number"
              min="1"
              required
              :class="{ 'error': errors.quantiteDemandee }"
              placeholder="Nombre d'unités à sortir"
            />
            <span v-if="errors.quantiteDemandee" class="error-message">{{ errors.quantiteDemandee }}</span>
          </div>
          <div class="form-group">
            <label for="raison">Raison de la sortie*</label>
            <select
              id="raison"
              v-model="formData.raison"
              required
              :class="{ 'error': errors.raison }"
            >
              <option value="">Sélectionnez une raison</option>
              <option value="VENTE">Vente</option>
              <option value="CONSOMMATION">Consommation interne</option>
              <option value="PEREMPTION">Produit périmé</option>
              <option value="CASSE">Casse/Dommage</option>
              <option value="ECHANTILLON">Échantillon</option>
              <option value="AUTRE">Autre</option>
            </select>
            <span v-if="errors.raison" class="error-message">{{ errors.raison }}</span>
          </div>
        </div>

        <div v-if="formData.raison === 'AUTRE'" class="form-row">
          <div class="form-group">
            <label for="raisonAutre">Précisez la raison*</label>
            <textarea
              id="raisonAutre"
              v-model="formData.raisonAutre"
              rows="3"
              required
              :class="{ 'error': errors.raisonAutre }"
              placeholder="Expliquez la raison de cette sortie..."
            ></textarea>
            <span v-if="errors.raisonAutre" class="error-message">{{ errors.raisonAutre }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé de la demande -->
    <div v-if="formData.boissonId && formData.quantiteDemandee > 0" class="request-summary">
      <h4 class="summary-title">Résumé de la Demande de Sortie</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Boisson :</span>
          <span class="summary-value">{{ selectedBoissonDetails?.nom }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Quantité demandée :</span>
          <span class="summary-value negative">{{ formData.quantiteDemandee }} unités</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Raison :</span>
          <span class="summary-value">{{ getRaisonText() }}</span>
        </div>
      </div>
      <div class="summary-note">
        <p><strong>Note :</strong> Le système sélectionnera automatiquement les lots disponibles pour cette boisson selon la stratégie FIFO (Premier Entré, Premier Sorti).</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-danger" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Traitement en cours...' : 'Confirmer la sortie' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Boisson } from '../../features/boissons/models/boisson'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'
import type { CreateMouvementSortieRequest } from '../../features/inventaire/models/createMouvementSortieRequest'
import { BoissonService } from '../../features/boissons/services/boissonService'
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateurService'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateMouvementSortieRequest]
  cancel: []
}>()

// État du formulaire
const formData = ref({
  boissonId: undefined as number | undefined,
  quantiteDemandee: 0,
  raison: '',
  raisonAutre: '',
  utilisateur: undefined as Utilisateur | undefined,
})

const errors = ref<Record<string, string>>({})
const selectedBoisson = ref<number | undefined>(undefined)

// Données de référence
const boissons = ref<Boisson[]>([])
const utilisateurs = ref<Utilisateur[]>([])

// Chargement des données
onMounted(async () => {
  try {
    const boissonsList = await BoissonService.getAllBoissons()
    boissons.value = boissonsList

    // Récupérer l'utilisateur courant depuis le localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      formData.value.utilisateur = JSON.parse(userStr)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

// Computed pour obtenir les détails de la boisson sélectionnée
const selectedBoissonDetails = computed(() => {
  if (!formData.value.boissonId) return null
  return boissons.value.find(b => b.id === formData.value.boissonId)
})

// Validation
const isFormValid = computed(() => {
  return formData.value.boissonId &&
         formData.value.quantiteDemandee > 0 &&
         formData.value.raison &&
         (formData.value.raison !== 'AUTRE' || formData.value.raisonAutre) &&
         Object.keys(errors.value).length === 0
})

// Fonctions utilitaires
const onBoissonChange = () => {
  // Réinitialiser les données de la boisson sélectionnée
  selectedBoisson.value = formData.value.boissonId
  errors.value = {}
}

const getRaisonText = () => {
  const raison = formData.value.raison
  if (raison === 'AUTRE') {
    return formData.value.raisonAutre || 'Précisé par l\'utilisateur'
  }
  return raison
}

// Validation et soumission
const validateForm = () => {
  errors.value = {}

  if (!formData.value.boissonId) {
    errors.value.boissonId = 'Veuillez sélectionner une boisson'
  }

  if (!formData.value.quantiteDemandee || formData.value.quantiteDemandee <= 0) {
    errors.value.quantiteDemandee = 'La quantité doit être supérieure à 0'
  }

  if (!formData.value.raison) {
    errors.value.raison = 'Veuillez sélectionner une raison'
  }

  if (formData.value.raison === 'AUTRE' && !formData.value.raisonAutre) {
    errors.value.raisonAutre = 'Veuillez préciser la raison'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const request: CreateMouvementSortieRequest = {
    boissonId: formData.value.boissonId!,
    quantiteDemandee: formData.value.quantiteDemandee,
    utilisateur: formData.value.utilisateur!
  }

  emit('submit', request)
}
</script>

<style scoped>
.sortie-form {
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
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.boisson-details {
  background: #fffbeb;
  border-color: #f59e0b;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
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

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Détails de la boisson */
.boisson-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.25rem;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

/* Résumé de la demande */
.request-summary {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
}

.summary-label {
  font-weight: 500;
  color: #374151;
}

.summary-value {
  font-weight: 600;
  color: #1f2937;
}

.summary-value.negative {
  color: #dc2626;
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
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
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

  .boisson-info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}

.summary-note {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.375rem;
  border-left: 4px solid #3b82f6;
}
</style>
