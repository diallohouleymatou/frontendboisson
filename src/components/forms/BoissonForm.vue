<template>
  <form @submit.prevent="handleSubmit" class="boisson-form">
    <div class="form-group">
      <label for="nom">Nom*</label>
      <input
        id="nom"
        v-model="formData.nom"
        type="text"
        required
        :class="{ 'error': errors.nom }"
      />
      <span v-if="errors.nom" class="error-message">{{ errors.nom }}</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label for="prix">Prix (€)*</label>
      <input
        id="prix"
        v-model.number="formData.prix"
        type="number"
        step="0.01"
        min="0"
        required
        :class="{ 'error': errors.prix }"
      />
      <span v-if="errors.prix" class="error-message">{{ errors.prix }}</span>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="volume">Volume*</label>
        <input
          id="volume"
          v-model.number="formData.volume"
          type="number"
          min="0"
          required
          :class="{ 'error': errors.volume }"
        />
        <span v-if="errors.volume" class="error-message">{{ errors.volume }}</span>
      </div>

      <div class="form-group">
        <label for="unite">Unité*</label>
        <select
          id="unite"
          v-model="formData.unite"
          required
          :class="{ 'error': errors.unite }"
        >
          <option value="ml">ml</option>
          <option value="cl">cl</option>
          <option value="l">l</option>
        </select>
        <span v-if="errors.unite" class="error-message">{{ errors.unite }}</span>
      </div>
    </div>

    <div class="form-group">
      <label for="seuil">Seuil d'alerte*</label>
      <input
        id="seuil"
        v-model.number="formData.seuil"
        type="number"
        min="0"
        required
        :class="{ 'error': errors.seuil }"
      />
      <span v-if="errors.seuil" class="error-message">{{ errors.seuil }}</span>
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
import type { Boisson } from '../../features/boissons/models/boisson'

const props = defineProps<{
  boisson?: Boisson | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: Boisson): void
  (e: 'cancel'): void
}>()

const formData = ref({
  nom: '',
  description: '',
  prix: 0,
  volume: 0,
  unite: 'ml',
  seuil: 0,
  isActive: true
})

const errors = ref({
  nom: '',
  prix: '',
  volume: '',
  unite: '',
  seuil: ''
})

const isSubmitting = ref(false)

// Initialize form with existing data if editing
watch(() => props.boisson, (newBoisson) => {
  if (newBoisson) {
    formData.value = { ...newBoisson }
  } else {
    // Reset form for new boisson
    formData.value = {
      nom: '',
      description: '',
      prix: 0,
      volume: 0,
      unite: 'ml',
      seuil: 0,
      isActive: true
    }
  }
}, { immediate: true })

const submitButtonText = computed(() => {
  return props.boisson ? 'Mettre à jour' : 'Créer'
})

const validateForm = () => {
  let isValid = true
  errors.value = {
    nom: '',
    prix: '',
    volume: '',
    unite: '',
    seuil: ''
  }

  if (!formData.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
    isValid = false
  }

  if (formData.value.prix <= 0) {
    errors.value.prix = 'Le prix doit être supérieur à 0'
    isValid = false
  }

  if (formData.value.volume <= 0) {
    errors.value.volume = 'Le volume doit être supérieur à 0'
    isValid = false
  }

  if (!formData.value.unite) {
    errors.value.unite = "L'unité est requise"
    isValid = false
  }

  if (formData.value.seuil < 0) {
    errors.value.seuil = "Le seuil d'alerte doit être positif"
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    emit('submit', formData.value)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.boisson-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.boisson-form input,
.boisson-form textarea,
.boisson-form select {
  background: #fff;
  color: #222;
  border: 1.5px solid #b0b8c1;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1rem;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(66,133,244,0.06);
  transition: border 0.18s, box-shadow 0.18s;
}

.boisson-form input:focus,
.boisson-form textarea:focus,
.boisson-form select:focus {
  border-color: #4285f4;
  outline: none;
  box-shadow: 0 0 0 2px #e3f0ff;
}

.boisson-form label {
  font-weight: 600;
  color: #4285f4;
  margin-bottom: 4px;
  display: block;
}

.boisson-form .form-group {
  margin-bottom: 18px;
}

.boisson-form .error-message {
  color: #ea4335;
  font-size: 0.95em;
  margin-top: 2px;
  display: block;
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
