<template>
  <form @submit.prevent="handleSubmit" class="mouvement-form">
    <div class="form-section">
      <h3 class="form-title">Sortie de stock</h3>

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
        <label for="quantite">Quantité*</label>
        <input
          id="quantite"
          v-model.number="formData.quantite"
          type="number"
          min="1"
          required
          :class="{ 'error': errors.quantite }"
          placeholder="Nombre d'unités à retirer"
        />
        <span v-if="errors.quantite" class="error-message">{{ errors.quantite }}</span>
      </div>

      <div class="form-group">
        <label for="raison">Raison de la sortie</label>
        <textarea
          id="raison"
          v-model="formData.raison"
          rows="3"
          :class="{ 'error': errors.raison }"
          placeholder="Motif de la sortie (optionnel)"
        ></textarea>
        <span v-if="errors.raison" class="error-message">{{ errors.raison }}</span>
      </div>

      <!-- Stock actuel (informatif) -->
      <div v-if="selectedBoisson" class="stock-info">
        <div class="info-item">
          <span class="info-label">Stock actuel:</span>
          <span class="info-value">{{ selectedBoisson.stockActuel || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Stock après sortie:</span>
          <span
            class="info-value"
            :class="{
              'text-danger': isStockBelowThreshold || stockAfterOperation < 0,
              'text-warning': stockAfterOperation >= 0 && isStockBelowThreshold,
              'text-success': stockAfterOperation >= 0 && !isStockBelowThreshold
            }"
          >
            {{ stockAfterOperation }}
          </span>
        </div>
        <div v-if="isStockBelowThreshold && stockAfterOperation >= 0" class="warning-message">
          ⚠️ Attention : Le stock sera en dessous du seuil minimum ({{ selectedBoisson.seuil || 0 }})
        </div>
        <div v-if="stockAfterOperation < 0" class="error-message">
          ❌ Erreur : Stock insuffisant pour cette opération
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
import { ref, computed, onMounted } from 'vue'
import { BoissonService } from '@/features/boissons/services/boissonService'

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

const boissons = ref([])
const isSubmitting = ref(false)

const formData = ref({
  boissonId: '',
  quantite: 0,
  raison: ''
})

const errors = ref({
  boissonId: '',
  quantite: '',
  raison: ''
})

// Computed
const selectedBoisson = computed(() => {
  return boissons.value.find(b => b.id === formData.value.boissonId)
})

const stockAfterOperation = computed(() => {
  if (!selectedBoisson.value || !formData.value.quantite) return selectedBoisson.value?.stockActuel || 0
  return (selectedBoisson.value. || 0) - formData.value.quantite
})

const isStockBelowThreshold = computed(() => {
  if (!selectedBoisson.value) return false
  return stockAfterOperation.value < (selectedBoisson.value.seuil || 0)
})

const submitButtonText = computed(() => {
  return isSubmitting.value ? 'Enregistrement...' : 'Retirer du stock'
})

const isValid = computed(() => {
  return formData.value.boissonId &&
         formData.value.quantite > 0 &&
         stockAfterOperation.value >= 0
})

// Methods
const validateForm = () => {
  let isValid = true
  errors.value = {
    boissonId: '',
    quantite: '',
    raison: ''
  }

  if (!formData.value.boissonId) {
    errors.value.boissonId = 'Veuillez sélectionner une boisson'
    isValid = false
  }

  if (!formData.value.quantite || formData.value.quantite <= 0) {
    errors.value.quantite = 'La quantité doit être supérieure à 0'
    isValid = false
  }

  if (stockAfterOperation.value < 0) {
    errors.value.quantite = 'Stock insuffisant pour cette opération'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const payload = {
      boissonId: formData.value.boissonId,
      quantite: formData.value.quantite,
      ...(formData.value.raison && { raison: formData.value.raison })
    }

    emit('submit', payload)

    // Réinitialiser le formulaire après succès
    formData.value = {
      boissonId: '',
      quantite: 0,
      raison: ''
    }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Charger les boissons au montage
onMounted(async () => {
  try {
    boissons.value = await BoissonService.getAllBoissons()
  } catch (error) {
    console.error('Erreur lors du chargement des boissons:', error)
  }
})
</script>

<style scoped>
.mouvement-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
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
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.warning-message {
  color: #f59e0b;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px;
  background: #fef3c7;
  border-radius: 4px;
}

.stock-info {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
}

.text-success {
  color: #059669;
}

.text-warning {
  color: #f59e0b;
}

.text-danger {
  color: #dc2626;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-primary {
  background: #dc2626;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
