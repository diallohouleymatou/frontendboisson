<template>
  <form @submit.prevent="handleSubmit" class="entree-form">
    <div class="form-header">
      <h3 class="form-title">Nouvelle Entrée de Stock</h3>
      <p class="form-description">Créer un nouveau lot et l'ajouter au stock</p>
    </div>

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

    <div class="form-group">
      <label for="fournisseur">Fournisseur*</label>
      <select
        id="fournisseur"
        v-model="formData.lot.fournisseur"
        required
        :class="{ 'error': errors.fournisseur }"
      >
        <option value="">Sélectionnez un fournisseur</option>
        <option v-for="fournisseur in fournisseurs" :key="fournisseur.id || fournisseur.nom" :value="fournisseur.id || ''">
          {{ fournisseur.nom }}
        </option>
      </select>
      <span v-if="errors.fournisseur" class="error-message">{{ errors.fournisseur }}</span>
    </div>

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

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="spinner"></span>
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
import { FournisseurService } from '../../features/fournisseur/services/fournisseurService'
import type {Fournisseur} from "../../features/fournisseur/models/fournisseur.ts";

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CreateLotRequest]
  cancel: []
}>()

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

const boissons = ref<Boisson[]>([])
const fournisseurs = ref<Fournisseur[]>([])

onMounted(async () => {
  try {
    const [boissonsList, fournisseursList] = await Promise.all([
      BoissonService.getAllBoissons(),
      FournisseurService.getAllFournisseurs()
    ])
    boissons.value = boissonsList
    fournisseurs.value = fournisseursList.filter(f => f.estActif)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      formData.value.utilisateur = JSON.parse(userStr)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

const isFormValid = computed(() => {
  return formData.value.lot.boisson &&
         formData.value.lot.numeroLot &&
         formData.value.lot.quantiteInitiale > 0 &&
         formData.value.lot.fournisseur &&
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

  if (!formData.value.lot.fournisseur) {
    errors.value.fournisseur = 'Veuillez sélectionner un fournisseur'
  }

  if (!formData.value.utilisateur) {
    errors.value.utilisateur = 'Veuillez sélectionner un utilisateur'
  }

  return Object.keys(errors.value).length === 0
}

const onBoissonChange = () => {
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

  formData.value.lot.quantiteActuelle = formData.value.lot.quantiteInitiale

  const lotToSend = {
    ...formData.value.lot,
    fournisseur: { id: formData.value.lot.fournisseur }
  }

  emit('submit', {
    lot: lotToSend,
    utilisateur: formData.value.utilisateur!,
  })
}
</script>

<style scoped>
.error-message {
  color: #ea4335;
  font-size: 0.95em;
  margin-top: 2px;
  display: block;
}
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f2f2f2;
  border-top: 2px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
