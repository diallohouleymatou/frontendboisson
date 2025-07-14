<template>
  <form @submit.prevent="handleSubmit" class="lot-form">
    <div class="form-group">
      <label for="boisson">Boisson*</label>
      <select
        id="boisson"
        v-model="formData.boissonId"
        required
        :class="{ 'error': errors.boissonId }"
      >
        <option value="">Sélectionnez une boisson</option>
        <option v-for="boisson in boissons" :key="boisson.id" :value="boisson.id">
          {{ boisson.nom }}
        </option>
      </select>
      <span v-if="errors.boissonId" class="error-message">{{ errors.boissonId }}</span>
    </div>

    <div class="form-group">
      <label for="quantiteInitiale">Quantité initiale*</label>
      <input
        id="quantiteInitiale"
        v-model.number="formData.quantiteInitiale"
        type="number"
        min="1"
        required
        :class="{ 'error': errors.quantiteInitiale }"
      />
      <span v-if="errors.quantiteInitiale" class="error-message">{{ errors.quantiteInitiale }}</span>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="dateEntree">Date d'entrée*</label>
        <input
          id="dateEntree"
          v-model="formData.dateEntree"
          type="date"
          required
          :class="{ 'error': errors.dateEntree }"
        />
        <span v-if="errors.dateEntree" class="error-message">{{ errors.dateEntree }}</span>
      </div>

      <div class="form-group">
        <label for="datePeremption">Date de péremption*</label>
        <input
          id="datePeremption"
          v-model="formData.datePeremption"
          type="date"
          required
          :min="formData.dateEntree"
          :class="{ 'error': errors.datePeremption }"
        />
        <span v-if="errors.datePeremption" class="error-message">{{ errors.datePeremption }}</span>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        {{ submitButtonText }}
        <span v-if="isSubmitting" class="spinner"></span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Lot } from '../../features/lots/models/lot'
import type { Boisson } from '../../features/boissons/models/boisson'

const props = defineProps<{
  lot?: Lot | null
  boissons: Boisson[]
}>()

const emit = defineEmits<{
  (e: 'submit', data: Lot): void
  (e: 'cancel'): void
}>()

const formData = ref({
  boissonId: '',
  quantiteInitiale: 0,
  dateEntree: new Date().toISOString().split('T')[0],
  datePeremption: '',
})

const errors = ref({
  boissonId: '',
  quantiteInitiale: '',
  dateEntree: '',
  datePeremption: ''
})

const isSubmitting = ref(false)

// Initialize form with existing data if editing
watch(() => props.lot, (newLot) => {
  if (newLot) {
    formData.value = {
      boissonId: newLot.boisson.id,
      quantiteInitiale: newLot.quantiteInitiale,
      dateEntree: new Date(newLot.dateEntree).toISOString().split('T')[0],
      datePeremption: new Date(newLot.datePeremption).toISOString().split('T')[0]
    }
  } else {
    // Reset form for new lot
    formData.value = {
      boissonId: '',
      quantiteInitiale: 0,
      dateEntree: new Date().toISOString().split('T')[0],
      datePeremption: ''
    }
  }
}, { immediate: true })

const submitButtonText = computed(() => {
  return props.lot ? 'Mettre à jour' : 'Créer'
})

const validateForm = () => {
  let isValid = true
  errors.value = {
    boissonId: '',
    quantiteInitiale: '',
    dateEntree: '',
    datePeremption: ''
  }

  if (!formData.value.boissonId) {
    errors.value.boissonId = 'Veuillez sélectionner une boisson'
    isValid = false
  }

  if (formData.value.quantiteInitiale <= 0) {
    errors.value.quantiteInitiale = 'La quantité doit être supérieure à 0'
    isValid = false
  }

  if (!formData.value.dateEntree) {
    errors.value.dateEntree = "La date d'entrée est requise"
    isValid = false
  }

  if (!formData.value.datePeremption) {
    errors.value.datePeremption = 'La date de péremption est requise'
    isValid = false
  } else if (formData.value.datePeremption <= formData.value.dateEntree) {
    errors.value.datePeremption = 'La date de péremption doit être postérieure à la date d\'entrée'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const selectedBoisson = props.boissons.find(b => b.id === formData.value.boissonId)
    if (!selectedBoisson) throw new Error('Boisson non trouvée')

    const lotData: Lot = {
      ...props.lot,
      boisson: selectedBoisson,
      quantiteInitiale: formData.value.quantiteInitiale,
      quantiteActuelle: props.lot ? props.lot.quantiteActuelle : formData.value.quantiteInitiale,
      dateEntree: new Date(formData.value.dateEntree),
      datePeremption: new Date(formData.value.datePeremption)
    }

    emit('submit', lotData)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.lot-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

input,
select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-500)1a;
}

input.error,
select.error {
  border-color: var(--color-error-500);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-error-500);
}

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

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-600);
}

.btn-primary:disabled {
  background: var(--color-primary-300);
  cursor: not-allowed;
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
