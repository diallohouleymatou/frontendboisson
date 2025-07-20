<template>
  <div class="change-password-container">
    <form @submit.prevent="handleSubmit" class="change-password-form">
      <h2>Changement de mot de passe</h2>

      <div class="form-group">
        <label for="oldPassword">Ancien mot de passe</label>
        <input
          type="password"
          id="oldPassword"
          v-model="oldPassword"
          required
        />
      </div>

      <div class="form-group">
        <label for="newPassword">Nouveau mot de passe</label>
        <input
          type="password"
          id="newPassword"
          v-model="newPassword"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
        />
      </div>

      <div class="error" v-if="error">{{ error }}</div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Modification en cours...' : 'Changer le mot de passe' }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'

export default defineComponent({
  name: 'ChangePasswordView',
  setup() {
    const router = useRouter()
    const oldPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    const isSubmitting = ref(false)

    const handleSubmit = async () => {
      error.value = ''

      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Les mots de passe ne correspondent pas'
        return
      }

      try {
        isSubmitting.value = true
        await UtilisateurService.updatePassword({
          oldPassword: oldPassword.value,
          newPassword: newPassword.value
        })
        router.push('/dashboard')
      } catch (e: any) {
        error.value = e.message || 'Une erreur est survenue'
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      oldPassword,
      newPassword,
      confirmPassword,
      error,
      isSubmitting,
      handleSubmit
    }
  }
})
</script>

<style scoped>
.change-password-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.change-password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
}

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
