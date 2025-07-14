<template>
  <form @submit.prevent="handleSubmit" class="stock-form">
    <div class="form-section">
      <div class="form-group">
        <label for="quantite">Quantité*</label>
        <input
          id="quantite"
          v-model.number="formData.quantite"
          type="number"
          min="1"
          required
          :class="{ 'error': errors.quantite }"
        />
        <span v-if="errors.quantite" class="error-message">{{ errors.quantite }}</span>
      </div>

      <!-- Champs spécifiques aux ajustements -->
      <template v-if="typeMouvement === 'AJUSTEMENT'">
        <div class="form-group">
          <label for="typeAjustement">Type d'ajustement*</label>
          <select
            id="typeAjustement"
            v-model="formData.typeAjustement"
            required
            :class="{ 'error': errors.typeAjustement }"
          >
            <option value="">Sélectionnez un type</option>
            <option v-for="type in typeAjustements" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
          <span v-if="errors.typeAjustement" class="error-message">{{ errors.typeAjustement }}</span>
        </div>

        <div class="form-group">
          <label for="raison">Raison*</label>
          <textarea
            id="raison"
            v-model="formData.raison"
            rows="3"
            required
            :class="{ 'error': errors.raison }"
          ></textarea>
          <span v-if="errors.raison" class="error-message">{{ errors.raison }}</span>
        </div>
      </template>

      <!-- Information sur le stock -->
      <div class="stock-info" v-if="stock">
        <div class="info-item">
          <span class="info-label">Stock actuel:</span>
          <span class="info-value">{{ stock.quantiteDisponible }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Seuil d'alerte:</span>
          <span class="info-value">{{ stock.boisson.seuil }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Stock après opération:</span>
          <span
            class="info-value"
            :class="{ 'text-danger': isStockBelowThreshold, 'text-success': !isStockBelowThreshold }"
          >
            {{ stockAfterOperation }}
          </span>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Annuler
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting || !isValid"
      >
        {{ submitButtonText }}
        <span v-if="isSubmitting" class="spinner"></span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Stock } from '../../features/stocks/models/stock'
import type { TypeMouvement } from '../../features/mouvements/models/typeMouvement'
import type { TypeAjustement } from '../../features/mouvements/models/typeAjustement'

const props = defineProps<{
  stock: Stock | null
  typeMouvement: TypeMouvement | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

const typeAjustements = [
  { value: 'CASSE', label: 'Casse' },
  { value: 'VOL', label: 'Vol' },
  { value: 'PERTE', label: 'Perte' },
  { value: 'RETOUR_CLIENT', label: 'Retour client' }
]

const formData = ref({
  quantite: 0,
  typeAjustement: '',
  raison: ''
})

const errors = ref({
  quantite: '',
  typeAjustement: '',
  raison: ''
})

const isSubmitting = ref(false)

// Computed properties
const submitButtonText = computed(() => {
  switch (props.typeMouvement) {
    case 'ENTREE':
      return isSubmitting.value ? 'Enregistrement...' : 'Enregistrer l\'entrée'
    case 'SORTIE':
      return isSubmitting.value ? 'Enregistrement...' : 'Enregistrer la sortie'
    case 'AJUSTEMENT':
      return isSubmitting.value ? 'Enregistrement...' : 'Enregistrer l\'ajustement'
    default:
      return 'Enregistrer'
  }
})

const stockAfterOperation = computed(() => {
  if (!props.stock || !formData.value.quantite) return props.stock?.quantiteDisponible || 0

  switch (props.typeMouvement) {
    case 'ENTREE':
      return props.stock.quantiteDisponible + formData.value.quantite
    case 'SORTIE':
      return props.stock.quantiteDisponible - formData.value.quantite
    case 'AJUSTEMENT':
      // Pour les ajustements, on considère que la quantité est positive pour les retours
      // et négative pour les autres types d'ajustement
      if (formData.value.typeAjustement === 'RETOUR_CLIENT') {
        return props.stock.quantiteDisponible + formData.value.quantite
      }
      return props.stock.quantiteDisponible - formData.value.quantite
    default:
      return props.stock.quantiteDisponible
  }
})

const isStockBelowThreshold = computed(() => {
  if (!props.stock) return false
  return stockAfterOperation.value < props.stock.boisson.seuil
})

const isValid = computed(() => {
  if (!formData.value.quantite || formData.value.quantite <= 0) return false

  if (props.typeMouvement === 'SORTIE' ||
      (props.typeMouvement === 'AJUSTEMENT' && formData.value.typeAjustement !== 'RETOUR_CLIENT')) {
    if (stockAfterOperation.value < 0) return false
  }

  if (props.typeMouvement === 'AJUSTEMENT') {
    if (!formData.value.typeAjustement || !formData.value.raison) return false
  }

  return true
})

// Methods
const validateForm = () => {
  let isValid = true
  errors.value = {
    quantite: '',
    typeAjustement: '',
    raison: ''
  }

  if (!formData.value.quantite || formData.value.quantite <= 0) {
    errors.value.quantite = 'La quantité doit être supérieure à 0'
    isValid = false
  }

  if (props.typeMouvement === 'SORTIE' ||
      (props.typeMouvement === 'AJUSTEMENT' && formData.value.typeAjustement !== 'RETOUR_CLIENT')) {
    if (stockAfterOperation.value < 0) {
      errors.value.quantite = 'Stock insuffisant pour cette opération'
      isValid = false
    }
  }

  if (props.typeMouvement === 'AJUSTEMENT') {
    if (!formData.value.typeAjustement) {
      errors.value.typeAjustement = "Le type d'ajustement est requis"
      isValid = false
    }
    if (!formData.value.raison.trim()) {
      errors.value.raison = 'La raison est requise'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const movementData = {
      type: props.typeMouvement,
      quantite: formData.value.quantite,
      boissonId: props.stock?.boisson.id,
      ...(props.typeMouvement === 'AJUSTEMENT' && {
        typeAjustement: formData.value.typeAjustement,
        raison: formData.value.raison
      })
    }

    emit('submit', movementData)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when type changes
watch(() => props.typeMouvement, () => {
  formData.value = {
    quantite: 0,
    typeAjustement: '',
    raison: ''
  }
  errors.value = {
    quantite: '',
    typeAjustement: '',
    raison: ''
  }
})
</script>

<style scoped>
.stock-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

input,
select,
textarea {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-500)1a;
}

.error {
  border-color: var(--color-error-500);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-error-500);
}

/* Stock info styles */
.stock-info {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-value {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.text-danger {
  color: var(--color-error-600);
}

.text-success {
  color: var(--color-success-600);
}

/* Button styles */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-medium);
}

.btn-secondary:hover {
  background: var(--color-bg-tertiary);
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-bg-primary);
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
