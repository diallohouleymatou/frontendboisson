<template>
  <form @submit.prevent="handleSubmit" class="sortie-form">
    <div class="form-header">
      <h3 class="form-title">Sortie de Stock</h3>
      <p class="form-description">Retirer des produits du stock existant</p>
    </div>

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

    <div v-if="selectedBoissonDetails" class="boisson-details">
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
      </div>
      <div class="summary-note">
        <p><strong>Note :</strong> Le système sélectionnera automatiquement les lots disponibles pour cette boisson selon la stratégie FIFO (Premier Entré, Premier Sorti).</p>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-danger" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="spinner"></span>
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

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateMouvementSortieRequest]
  cancel: []
}>()

const formData = ref({
  boissonId: undefined as number | undefined,
  quantiteDemandee: 0,
  utilisateur: undefined as Utilisateur | undefined,
})

const errors = ref<Record<string, string>>({})
const selectedBoisson = ref<number | undefined>(undefined)
const boissons = ref<Boisson[]>([])

onMounted(async () => {
  try {
    const boissonsList = await BoissonService.getAllBoissons()
    boissons.value = boissonsList
    const userStr = localStorage.getItem('user')
    if (userStr) {
      formData.value.utilisateur = JSON.parse(userStr)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

const selectedBoissonDetails = computed(() => {
  if (!formData.value.boissonId) return null
  return boissons.value.find(b => b.id === formData.value.boissonId)
})

const isFormValid = computed(() => {
  return formData.value.boissonId &&
         formData.value.quantiteDemandee > 0 &&
         Object.keys(errors.value).length === 0
})

const onBoissonChange = () => {
  selectedBoisson.value = formData.value.boissonId
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  if (!formData.value.boissonId) {
    errors.value.boissonId = 'Veuillez sélectionner une boisson'
  }
  if (!formData.value.quantiteDemandee || formData.value.quantiteDemandee <= 0) {
    errors.value.quantiteDemandee = 'La quantité doit être supérieure à 0'
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
.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f2f2f2;
  border-top: 2px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
