<template>
  <form @submit.prevent="handleSubmit" class="ajustement-form">
    <div class="form-header">
      <h3 class="form-title">Ajustement de Stock</h3>
      <p class="form-description">Corriger les quantités en stock pour résoudre les écarts d'inventaire</p>
    </div>

    <div class="form-sections">
      <!-- Section Sélection du lot -->
      <div class="form-section">
        <h4 class="section-title">Sélection du Lot à Ajuster</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="boisson">Filtrer par boisson</label>
            <select
              id="boisson"
              v-model="selectedBoisson"
              @change="filterLots"
            >
              <option value="">Toutes les boissons</option>
              <option v-for="boisson in boissons" :key="boisson.id" :value="boisson">
                {{ boisson.nom }} - {{ boisson.volume }}{{ boisson.unite }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="lot">Lot à ajuster*</label>
            <select
              id="lot"
              v-model="formData.lot"
              required
              :class="{ 'error': errors.lot }"
              @change="onLotChange"
            >
              <option value="">Sélectionnez un lot</option>
              <option v-for="lot in filteredLots" :key="lot.id" :value="lot">
                {{ lot.numeroLot }} - {{ lot.boisson?.nom }} ({{ lot.quantiteActuelle }} en stock)
              </option>
            </select>
            <span v-if="errors.lot" class="error-message">{{ errors.lot }}</span>
          </div>
        </div>
      </div>

      <!-- Détails du lot sélectionné -->
      <div v-if="formData.lot" class="form-section lot-details">
        <h4 class="section-title">État Actuel du Lot</h4>
        <div class="lot-info-grid">
          <div class="info-item">
            <span class="info-label">Numéro de lot :</span>
            <span class="info-value">{{ formData.lot.numeroLot }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Boisson :</span>
            <span class="info-value">{{ formData.lot.boisson?.nom }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Stock système :</span>
            <span class="info-value stock-current">{{ formData.lot.quantiteActuelle }} unités</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fournisseur :</span>
            <span class="info-value">{{ formData.lot.fournisseur || 'Non renseigné' }}</span>
          </div>
        </div>
      </div>

      <!-- Section Type d'ajustement -->
      <div class="form-section">
        <h4 class="section-title">Type d'Ajustement</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="typeAjustement">Type d'ajustement*</label>
            <select
              id="typeAjustement"
              v-model="formData.typeAjustement"
              required
              :class="{ 'error': errors.typeAjustement }"
              @change="onTypeChange"
            >
              <option value="">Sélectionnez un type</option>
              <option value="INVENTAIRE">Correction d'inventaire</option>
              <option value="CASSE">Produit cassé/endommagé</option>
              <option value="PEREMPTION">Produit périmé</option>
              <option value="PERTE">Perte/Vol</option>
              <option value="ERREUR_SAISIE">Erreur de saisie</option>
              <option value="AUTRE">Autre raison</option>
            </select>
            <span v-if="errors.typeAjustement" class="error-message">{{ errors.typeAjustement }}</span>
          </div>
          <div class="form-group">
            <label for="modeAjustement">Mode d'ajustement*</label>
            <select
              id="modeAjustement"
              v-model="formData.modeAjustement"
              required
              :class="{ 'error': errors.modeAjustement }"
              @change="onModeChange"
            >
              <option value="">Sélectionnez un mode</option>
              <option value="NOUVELLE_QUANTITE">Définir nouvelle quantité</option>
              <option value="DIFFERENCE">Ajuster par différence</option>
            </select>
            <span v-if="errors.modeAjustement" class="error-message">{{ errors.modeAjustement }}</span>
          </div>
        </div>
      </div>

      <!-- Section Quantité -->
      <div v-if="formData.modeAjustement" class="form-section quantity-section">
        <h4 class="section-title">Ajustement des Quantités</h4>

        <div v-if="formData.modeAjustement === 'NOUVELLE_QUANTITE'" class="form-row">
          <div class="form-group">
            <label for="nouvelleQuantite">Nouvelle quantité réelle*</label>
            <input
              id="nouvelleQuantite"
              v-model.number="formData.nouvelleQuantite"
              type="number"
              min="0"
              required
              :class="{ 'error': errors.nouvelleQuantite }"
              placeholder="Quantité réelle comptée"
              @input="calculateDifference"
            />
            <div class="quantity-helper">
              <span class="helper-text">
                Quantité actuelle dans le système : {{ formData.lot?.quantiteActuelle || 0 }}
              </span>
            </div>
            <span v-if="errors.nouvelleQuantite" class="error-message">{{ errors.nouvelleQuantite }}</span>
          </div>
        </div>

        <div v-if="formData.modeAjustement === 'DIFFERENCE'" class="form-row">
          <div class="form-group">
            <label for="typeDifference">Type de différence*</label>
            <select
              id="typeDifference"
              v-model="formData.typeDifference"
              required
              :class="{ 'error': errors.typeDifference }"
              @change="onTypeDifferenceChange"
            >
              <option value="">Sélectionnez</option>
              <option value="AJOUTER">Ajouter des unités</option>
              <option value="RETIRER">Retirer des unités</option>
            </select>
            <span v-if="errors.typeDifference" class="error-message">{{ errors.typeDifference }}</span>
          </div>
          <div class="form-group">
            <label for="quantiteDifference">Quantité à {{ formData.typeDifference === 'AJOUTER' ? 'ajouter' : 'retirer' }}*</label>
            <input
              id="quantiteDifference"
              v-model.number="formData.quantiteDifference"
              type="number"
              min="1"
              :max="formData.typeDifference === 'RETIRER' ? formData.lot?.quantiteActuelle : 999999"
              required
              :class="{ 'error': errors.quantiteDifference }"
              placeholder="Nombre d'unités"
              @input="calculateFromDifference"
            />
            <span v-if="errors.quantiteDifference" class="error-message">{{ errors.quantiteDifference }}</span>
          </div>
        </div>
      </div>

      <!-- Section Raison -->
      <div class="form-section">
        <h4 class="section-title">Justification</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="raison">Raison détaillée*</label>
            <textarea
              id="raison"
              v-model="formData.raison"
              rows="4"
              required
              :class="{ 'error': errors.raison }"
              placeholder="Expliquez en détail la raison de cet ajustement..."
            ></textarea>
            <span v-if="errors.raison" class="error-message">{{ errors.raison }}</span>
          </div>
        </div>
      </div>

      <!-- Section Utilisateur -->
      <div class="form-section">
        <h4 class="section-title">Responsable</h4>
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
                {{ utilisateur.email }}
              </option>
            </select>
            <span v-if="errors.utilisateur" class="error-message">{{ errors.utilisateur }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Aperçu de l'ajustement -->
    <div v-if="hasValidAdjustment" class="adjustment-preview">
      <h4 class="preview-title">Aperçu de l'Ajustement</h4>
      <div class="adjustment-comparison">
        <div class="comparison-item">
          <h5>Avant</h5>
          <div class="stock-display current">
            <span class="stock-value">{{ formData.lot?.quantiteActuelle || 0 }}</span>
            <span class="stock-label">unités</span>
          </div>
        </div>

        <div class="comparison-arrow">
          <ArrowRightIcon class="w-6 h-6" />
          <span class="adjustment-type" :class="adjustmentClass">
            {{ adjustmentText }}
          </span>
        </div>

        <div class="comparison-item">
          <h5>Après</h5>
          <div class="stock-display new" :class="getNewStockClass()">
            <span class="stock-value">{{ calculatedNewQuantity }}</span>
            <span class="stock-label">unités</span>
          </div>
        </div>
      </div>

      <div class="adjustment-summary">
        <div class="summary-item">
          <span class="summary-label">Type :</span>
          <span class="summary-value">{{ getTypeLabel(formData.typeAjustement) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Impact :</span>
          <span class="summary-value" :class="adjustmentClass">
            {{ Math.abs(difference) }} unité(s) {{ difference >= 0 ? 'ajoutée(s)' : 'retirée(s)' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-warning" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Ajustement en cours...' : 'Confirmer l\'ajustement' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import type { Lot } from '../../features/inventaire/models/lot'
import type { Boisson } from '../../features/boissons/models/boisson'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'
import type { CreateMouvementAjustementRequest } from '../../features/inventaire/models/createMouvementAjustementRequest'
import { inventaireService } from '../../features/inventaire/services/inventaireService'
import { BoissonService } from '../../features/boissons/services/boissonService'
import { UtilisateurService } from '../../features/utilisateurs/services/utilisateurService'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateMouvementAjustementRequest]
  cancel: []
}>()

// État du formulaire
const formData = ref({
  lot: undefined as Lot | undefined,
  typeAjustement: '',
  modeAjustement: '',
  nouvelleQuantite: 0,
  typeDifference: '',
  quantiteDifference: 0,
  raison: '',
  utilisateur: undefined as Utilisateur | undefined,
})

const errors = ref<Record<string, string>>({})
const selectedBoisson = ref<Boisson>()

// Données de référence
const lots = ref<Lot[]>([])
const boissons = ref<Boisson[]>([])
const utilisateurs = ref<Utilisateur[]>([])
const filteredLots = ref<Lot[]>([])

// Chargement des données
onMounted(async () => {
  try {
    const [lotsList, boissonsList, utilisateursList] = await Promise.all([
      inventaireService.getAllLots(),
      BoissonService.getAllBoissons(),
      UtilisateurService.getAllUtilisateurs(),
    ])

    lots.value = lotsList
    boissons.value = boissonsList
    utilisateurs.value = utilisateursList
    filteredLots.value = lots.value
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

// Calculs
const calculatedNewQuantity = computed(() => {
  if (!formData.value.lot) return 0

  if (formData.value.modeAjustement === 'NOUVELLE_QUANTITE') {
    return formData.value.nouvelleQuantite
  } else if (formData.value.modeAjustement === 'DIFFERENCE') {
    const current = formData.value.lot.quantiteActuelle
    if (formData.value.typeDifference === 'AJOUTER') {
      return current + formData.value.quantiteDifference
    } else if (formData.value.typeDifference === 'RETIRER') {
      return current - formData.value.quantiteDifference
    }
  }

  return formData.value.lot.quantiteActuelle
})

const difference = computed(() => {
  if (!formData.value.lot) return 0
  return calculatedNewQuantity.value - formData.value.lot.quantiteActuelle
})

const adjustmentClass = computed(() => {
  return difference.value >= 0 ? 'positive' : 'negative'
})

const adjustmentText = computed(() => {
  const abs = Math.abs(difference.value)
  return difference.value >= 0 ? `+${abs}` : `-${abs}`
})

const hasValidAdjustment = computed(() => {
  return formData.value.lot &&
         formData.value.modeAjustement &&
         (
           (formData.value.modeAjustement === 'NOUVELLE_QUANTITE' && formData.value.nouvelleQuantite >= 0) ||
           (formData.value.modeAjustement === 'DIFFERENCE' && formData.value.typeDifference && formData.value.quantiteDifference > 0)
         ) &&
         difference.value !== 0
})

// Validation
const isFormValid = computed(() => {
  return formData.value.lot &&
         formData.value.typeAjustement &&
         formData.value.modeAjustement &&
         formData.value.raison &&
         formData.value.utilisateur &&
         hasValidAdjustment.value &&
         Object.keys(errors.value).length === 0
})

// Fonctions utilitaires
const filterLots = () => {
  if (!selectedBoisson.value) {
    filteredLots.value = lots.value
  } else {
    filteredLots.value = lots.value.filter(lot =>
      lot.boisson?.id === selectedBoisson.value?.id
    )
  }

  // Réinitialiser la sélection si le lot n'est plus dans la liste filtrée
  if (formData.value.lot && !filteredLots.value.find(lot => lot.id === formData.value.lot?.id)) {
    resetForm()
  }
}

const onLotChange = () => {
  resetQuantities()
}

const onTypeChange = () => {
  resetQuantities()
}

const onModeChange = () => {
  resetQuantities()
}

const onTypeDifferenceChange = () => {
  formData.value.quantiteDifference = 0
}

const resetQuantities = () => {
  formData.value.nouvelleQuantite = formData.value.lot?.quantiteActuelle || 0
  formData.value.typeDifference = ''
  formData.value.quantiteDifference = 0
}

const resetForm = () => {
  formData.value.lot = undefined
  resetQuantities()
  errors.value = {}
}

const calculateDifference = () => {
  // Validation en temps réel
  if (formData.value.nouvelleQuantite < 0) {
    errors.value.nouvelleQuantite = 'La quantité ne peut pas être négative'
  } else {
    delete errors.value.nouvelleQuantite
  }
}

const calculateFromDifference = () => {
  // Validation en temps réel
  if (formData.value.typeDifference === 'RETIRER' &&
      formData.value.lot &&
      formData.value.quantiteDifference > formData.value.lot.quantiteActuelle) {
    errors.value.quantiteDifference = `Maximum : ${formData.value.lot.quantiteActuelle}`
  } else {
    delete errors.value.quantiteDifference
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'INVENTAIRE': 'Correction d\'inventaire',
    'CASSE': 'Produit cassé/endommagé',
    'PEREMPTION': 'Produit périmé',
    'PERTE': 'Perte/Vol',
    'ERREUR_SAISIE': 'Erreur de saisie',
    'AUTRE': 'Autre raison'
  }
  return labels[type] || type
}

const getNewStockClass = () => {
  const newStock = calculatedNewQuantity.value
  if (newStock === 0) return 'empty'
  if (newStock < 10) return 'low'
  return 'normal'
}

// Validation et soumission
const validateForm = () => {
  errors.value = {}

  if (!formData.value.lot) {
    errors.value.lot = 'Veuillez sélectionner un lot'
  }

  if (!formData.value.typeAjustement) {
    errors.value.typeAjustement = 'Veuillez sélectionner un type'
  }

  if (!formData.value.modeAjustement) {
    errors.value.modeAjustement = 'Veuillez sélectionner un mode'
  }

  if (formData.value.modeAjustement === 'NOUVELLE_QUANTITE') {
    if (formData.value.nouvelleQuantite < 0) {
      errors.value.nouvelleQuantite = 'La quantité ne peut pas être négative'
    }
  }

  if (formData.value.modeAjustement === 'DIFFERENCE') {
    if (!formData.value.typeDifference) {
      errors.value.typeDifference = 'Veuillez sélectionner le type de différence'
    }

    if (!formData.value.quantiteDifference || formData.value.quantiteDifference <= 0) {
      errors.value.quantiteDifference = 'La quantité doit être supérieure à 0'
    }
  }

  if (!formData.value.raison || formData.value.raison.length < 10) {
    errors.value.raison = 'Veuillez fournir une justification détaillée (min. 10 caractères)'
  }

  if (!formData.value.utilisateur) {
    errors.value.utilisateur = 'Veuillez sélectionner un utilisateur'
  }

  if (difference.value === 0) {
    errors.value.general = 'Aucun ajustement détecté. Modifiez les quantités.'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const request: CreateMouvementAjustementRequest = {
    lotId: formData.value.lot!.id!,
    delta: difference.value,
    raison: formData.value.raison,
    utilisateur: formData.value.utilisateur!
  }

  emit('submit', request)
}
</script>

<style scoped>
.ajustement-form {
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
  color: #d97706;
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

.lot-details {
  background: #fef3c7;
  border-color: #d97706;
}

.quantity-section {
  background: #f0f9ff;
  border-color: #0ea5e9;
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
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.quantity-helper {
  margin-top: 0.25rem;
}

.helper-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Détails du lot */
.lot-info-grid {
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

.stock-current {
  color: #0ea5e9;
}

/* Aperçu de l'ajustement */
.adjustment-preview {
  background: #fefce8;
  border: 1px solid #eab308;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #a16207;
  margin-bottom: 1.5rem;
  text-align: center;
}

.adjustment-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.comparison-item {
  text-align: center;
}

.comparison-item h5 {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.stock-display {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid;
}

.stock-display.current {
  background: #e0f2fe;
  border-color: #0ea5e9;
}

.stock-display.new.normal {
  background: #dcfce7;
  border-color: #22c55e;
}

.stock-display.new.low {
  background: #fed7aa;
  border-color: #f59e0b;
}

.stock-display.new.empty {
  background: #fee2e2;
  border-color: #ef4444;
}

.stock-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stock-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.comparison-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #d97706;
}

.adjustment-type {
  font-weight: 600;
  font-size: 1.125rem;
}

.adjustment-type.positive {
  color: #059669;
}

.adjustment-type.negative {
  color: #dc2626;
}

.adjustment-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.375rem;
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

.btn-warning {
  background: #d97706;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #b45309;
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

  .lot-info-grid,
  .adjustment-summary {
    grid-template-columns: 1fr;
  }

  .adjustment-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .comparison-arrow {
    transform: rotate(90deg);
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
