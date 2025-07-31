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
      <label for="prix">Prix (FCFA)*</label>
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
  seuil: 0
})

const errors = ref({
  nom: '',
  prix: '',
  volume: '',
  unite: '',
  seuil: ''
})

const isSubmitting = ref(false)

watch(() => props.boisson, (newBoisson) => {
  if (newBoisson) {
    formData.value = { ...newBoisson }
  } else {
    formData.value = {
      nom: '',
      description: '',
      prix: 0,
      volume: 0,
      unite: 'ml',
      seuil: 0
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
