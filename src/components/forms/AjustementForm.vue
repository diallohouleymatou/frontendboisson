<template>
  <form @submit.prevent="handleSubmit" class="ajustement-form">
    <div class="form-header">
      <h3 class="form-title">Ajustement de Stock</h3>
      <p class="form-description">Corriger les quantités en stock pour résoudre les écarts d'inventaire</p>
    </div>

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

    <div v-if="formData.lot" class="lot-details">
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
      </div>
    </div>

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

    <div v-if="formData.modeAjustement === 'NOUVELLE_QUANTITE'" class="form-group">
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
      <span v-if="errors.nouvelleQuantite" class="error-message">{{ errors.nouvelleQuantite }}</span>
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

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary" :disabled="isLoading">
        Annuler
      </button>
      <button type="submit" class="btn btn-warning" :disabled="isLoading || !isFormValid">
        <span v-if="isLoading" class="spinner"></span>
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

    // Définir l'utilisateur courant depuis le localStorage
    const currentUser = localStorage.getItem('user')
    if (currentUser) {
      formData.value.utilisateur = JSON.parse(currentUser)
    }
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
  border-top: 2px solid #d97706;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
