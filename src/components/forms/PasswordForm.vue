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
  padding: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.error-message {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-error-600);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
}

.btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-text-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-gray-200);
}

.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}
</style>
