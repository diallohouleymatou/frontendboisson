<template>
  <form @submit.prevent="handleSubmit" class="sortie-form">
    <div class="form-header">
      <h3 class="form-title">Sortie de Stock</h3>
      <p class="form-description">Retirer des produits du stock existant</p>
    </div>

    <div class="form-sections">
      <!-- Section Sélection du lot -->
      <div class="form-section">
        <h4 class="section-title">Sélection du Lot</h4>
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
                {{ boisson.nom }} - {{ boisson.format }} {{ boisson.volume }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="lot">Lot à utiliser*</label>
            <select
              id="lot"
              v-model="formData.lot"
              required
              :class="{ 'error': errors.lot }"
              @change="onLotChange"
            >
              <option value="">Sélectionnez un lot</option>
              <option v-for="lot in filteredLots" :key="lot.id" :value="lot">
                {{ lot.numeroLot }} - {{ lot.boisson?.nom }} ({{ lot.quantiteActuelle }} restant)
              </option>
            </select>
            <span v-if="errors.lot" class="error-message">{{ errors.lot }}</span>
          </div>
        </div>
      </div>

      <!-- Détails du lot sélectionné -->
      <div v-if="formData.lot" class="form-section lot-details">
        <h4 class="section-title">Détails du Lot Sélectionné</h4>
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
            <span class="info-label">Stock disponible :</span>
            <span class="info-value stock-available">{{ formData.lot.quantiteActuelle }} unités</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date de péremption :</span>
            <span class="info-value" :class="getExpirationClass(formData.lot.datePeremption)">
              {{ formatDate(formData.lot.datePeremption) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Section Sortie -->
      <div class="form-section">
        <h4 class="section-title">Détails de la Sortie</h4>
        <div class="form-row">
          <div class="form-group">
            <label for="quantite">Quantité à sortir*</label>
            <input
              id="quantite"
              v-model.number="formData.quantite"
              type="number"
              min="1"
              :max="formData.lot?.quantiteActuelle || 999999"
              required
              :class="{ 'error': errors.quantite }"
              placeholder="Nombre d'unités"
              @input="calculateRemaining"
            />
            <div class="quantity-helper">
              <span v-if="formData.lot" class="helper-text">
                Maximum disponible : {{ formData.lot.quantiteActuelle }} unités
              </span>
            </div>
            <span v-if="errors.quantite" class="error-message">{{ errors.quantite }}</span>
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

    <!-- Aperçu de l'impact -->
    <div v-if="formData.lot && formData.quantite" class="impact-preview">
      <h4 class="preview-title">Aperçu de l'Impact</h4>
      <div class="impact-grid">
        <div class="impact-item">
          <span class="impact-label">Stock actuel :</span>
          <span class="impact-value">{{ formData.lot.quantiteActuelle }} unités</span>
        </div>
        <div class="impact-item">
          <span class="impact-label">Quantité sortie :</span>
          <span class="impact-value negative">-{{ formData.quantite }} unités</span>
        </div>
        <div class="impact-item">
          <span class="impact-label">Stock restant :</span>
          <span class="impact-value" :class="getStockClass(remainingStock)">
            {{ remainingStock }} unités
          </span>
        </div>
        <div class="impact-item">
          <span class="impact-label">Statut :</span>
          <span class="impact-status" :class="getStatusClass(remainingStock)">
            {{ getStatusText(remainingStock) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-danger" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Sortie en cours...' : 'Confirmer la sortie' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Lot } from '../../features/inventaire/models/lot'
import type { Boisson } from '../../features/boissons/models/boisson'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'
import { inventaireService } from '../../features/inventaire/services/inventaireService'
import { boissonService } from '../../features/boissons/services/boissonService'
import { utilisateurService } from '../../features/utilisateurs/services/utilisateurService'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// État du formulaire
const formData = ref({
  lot: undefined as Lot | undefined,
  quantite: 0,
  raison: '',
  raisonAutre: '',
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
      boissonService.getAllBoissons(),
      utilisateurService.getAllUtilisateurs(),
    ])

    // Filtrer uniquement les lots avec du stock disponible
    lots.value = lotsList.filter(lot => lot.quantiteActuelle > 0)
    boissons.value = boissonsList
    utilisateurs.value = utilisateursList
    filteredLots.value = lots.value
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

// Calculs
const remainingStock = computed(() => {
  if (!formData.value.lot || !formData.value.quantite) return 0
  return formData.value.lot.quantiteActuelle - formData.value.quantite
})

// Validation
const isFormValid = computed(() => {
  return formData.value.lot &&
         formData.value.quantite > 0 &&
         formData.value.quantite <= formData.value.lot.quantiteActuelle &&
         formData.value.raison &&
         (formData.value.raison !== 'AUTRE' || formData.value.raisonAutre) &&
         formData.value.utilisateur &&
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
    formData.value.lot = undefined
    formData.value.quantite = 0
  }
}

const onLotChange = () => {
  formData.value.quantite = 0
  errors.value = {}
}

const calculateRemaining = () => {
  // Validation en temps réel de la quantité
  if (formData.value.lot && formData.value.quantite > formData.value.lot.quantiteActuelle) {
    errors.value.quantite = `Maximum disponible : ${formData.value.lot.quantiteActuelle}`
  } else {
    delete errors.value.quantite
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getExpirationClass = (dateString: string) => {
  const expirationDate = new Date(dateString)
  const now = new Date()
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) return 'expired'
  if (daysUntilExpiration <= 7) return 'warning'
  if (daysUntilExpiration <= 30) return 'caution'
  return 'normal'
}

const getStockClass = (stock: number) => {
  if (stock === 0) return 'empty'
  if (stock < 10) return 'low'
  return 'normal'
}

const getStatusClass = (stock: number) => {
  if (stock === 0) return 'status-empty'
  if (stock < 10) return 'status-low'
  return 'status-normal'
}

const getStatusText = (stock: number) => {
  if (stock === 0) return 'Stock épuisé'
  if (stock < 10) return 'Stock faible'
  return 'Stock normal'
}

// Validation et soumission
const validateForm = () => {
  errors.value = {}

  if (!formData.value.lot) {
    errors.value.lot = 'Veuillez sélectionner un lot'
  }

  if (!formData.value.quantite || formData.value.quantite <= 0) {
    errors.value.quantite = 'La quantité doit être supérieure à 0'
  } else if (formData.value.lot && formData.value.quantite > formData.value.lot.quantiteActuelle) {
    errors.value.quantite = `Quantité maximale : ${formData.value.lot.quantiteActuelle}`
  }

  if (!formData.value.raison) {
    errors.value.raison = 'Veuillez sélectionner une raison'
  }

  if (formData.value.raison === 'AUTRE' && !formData.value.raisonAutre) {
    errors.value.raisonAutre = 'Veuillez préciser la raison'
  }

  if (!formData.value.utilisateur) {
    errors.value.utilisateur = 'Veuillez sélectionner un utilisateur'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const raisonFinal = formData.value.raison === 'AUTRE'
    ? formData.value.raisonAutre
    : formData.value.raison

  emit('submit', {
    lotId: formData.value.lot!.id,
    quantite: formData.value.quantite,
    raison: raisonFinal,
    utilisateur: formData.value.utilisateur,
    dateMouvement: new Date().toISOString(),
    type: 'SORTIE'
  })
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

.lot-details {
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

.stock-available {
  color: #059669;
}

.expired {
  color: #dc2626;
}

.warning {
  color: #ea580c;
}

.caution {
  color: #d97706;
}

.normal {
  color: #059669;
}

/* Aperçu de l'impact */
.impact-preview {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 1rem;
}

.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.impact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
}

.impact-label {
  font-weight: 500;
  color: #374151;
}

.impact-value {
  font-weight: 600;
  color: #1f2937;
}

.impact-value.negative {
  color: #dc2626;
}

.impact-value.empty {
  color: #dc2626;
}

.impact-value.low {
  color: #ea580c;
}

.impact-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-empty {
  background: #fee2e2;
  color: #991b1b;
}

.status-low {
  background: #fed7aa;
  color: #9a3412;
}

.status-normal {
  background: #dcfce7;
  color: #166534;
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

  .lot-info-grid,
  .impact-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
