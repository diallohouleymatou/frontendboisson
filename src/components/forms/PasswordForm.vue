<template>
  <div class="password-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="currentPassword" class="form-label">Mot de passe actuel</label>
        <input
          id="currentPassword"
          v-model="form.currentPassword"
          type="password"
          class="form-input"
          placeholder="Saisissez le mot de passe actuel"
          required
        />
      </div>

      <div class="form-group">
        <label for="newPassword" class="form-label">Nouveau mot de passe</label>
        <input
          id="newPassword"
          v-model="form.newPassword"
          type="password"
          class="form-input"
          placeholder="Saisissez le nouveau mot de passe"
          required
          minlength="6"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          placeholder="Confirmez le nouveau mot de passe"
          required
          minlength="6"
        />
        <div v-if="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" class="error-message">
          Les mots de passe ne correspondent pas
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn btn-secondary">
          Annuler
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!isFormValid"
        >
          Changer le mot de passe
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur'

interface Props {
  utilisateur: Utilisateur
}

interface Emits {
  (e: 'submit', data: { currentPassword: string; newPassword: string }): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.value.currentPassword.length >= 6 &&
         form.value.newPassword.length >= 6 &&
         form.value.confirmPassword.length >= 6 &&
         form.value.newPassword === form.value.confirmPassword
})

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.password-form {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px #e3f0fd;
}

.error-message {
  margin-top: 4px;
  font-size: 0.875rem;
  color: #d32f2f;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #757575;
}

.btn-secondary:hover:not(:disabled) {
  background: #eeeeee;
}

.btn-primary {
  background: #4285f4;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3367d6;
}
</style>
