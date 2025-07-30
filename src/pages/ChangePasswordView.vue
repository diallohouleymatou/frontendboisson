<template>
  <div class="page-container">
    <div class="card">
      <h2 class="card-title">Changement de mot de passe</h2>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="oldPassword" class="form-label">Ancien mot de passe</label>
          <input
            id="oldPassword"
            v-model="oldPassword"
            type="password"
            class="form-input"
            placeholder="Saisissez votre ancien mot de passe"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="newPassword" class="form-label">Nouveau mot de passe</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            class="form-input"
            placeholder="Saisissez votre nouveau mot de passe"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="Confirmez votre nouveau mot de passe"
            required
            minlength="6"
          />
          <div v-if="passwordMismatch" class="error-message">
            Les mots de passe ne correspondent pas
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Modification en cours...' : 'Changer le mot de passe' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
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
    if (localStorage.getItem('lastLoginPassword')) {
      oldPassword.value = localStorage.getItem('lastLoginPassword') || ''
      localStorage.removeItem('lastLoginPassword')
    }

    const passwordMismatch = computed(() => {
      return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value
    })

    const isFormValid = computed(() => {
      return oldPassword.value.length >= 6 &&
             newPassword.value.length >= 6 &&
             confirmPassword.value.length >= 6 &&
             !passwordMismatch.value
    })

    const handleSubmit = async () => {
      error.value = ''
      console.log('[ChangePassword] Début handleSubmit')
      if (!isFormValid.value) {
        console.log('[ChangePassword] Formulaire invalide', {
          oldPassword: oldPassword.value,
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value
        })
        return
      }
      isSubmitting.value = true
      const user = UtilisateurService.getCurrentUser()
      const userId = user?.id
      console.log('[ChangePassword] Utilisateur courant', user)
      if (!userId) {
        error.value = "Utilisateur non connecté"
        isSubmitting.value = false
        console.log('[ChangePassword] Utilisateur non connecté')
        return
      }
      try {
        console.log('[ChangePassword] Tentative de changement de mot de passe', {
          userId,
          ancienMotDePasse: oldPassword.value,
          nouveauMotDePasse: newPassword.value
        })
        console.log('[ChangePassword] Appel UtilisateurService.changePassword...')
        await UtilisateurService.changePassword(userId, {
          ancienMotDePasse: oldPassword.value,
          nouveauMotDePasse: newPassword.value
        })
        console.log('[ChangePassword] Retour de UtilisateurService.changePassword')
        console.log('[ChangePassword] Changement de mot de passe réussi')
        router.push('/dashboard')
      } catch (e: any) {
        console.log('[ChangePassword] Erreur attrapée lors du changement de mot de passe', e)
        if (e.response && e.response.data && e.response.data.message) {
          error.value = e.response.data.message
          console.log('[ChangePassword] Message d\'erreur API:', e.response.data.message)
        } else {
          error.value = e.message || 'Une erreur est survenue lors du changement de mot de passe'
          console.log('[ChangePassword] Message d\'erreur JS:', e.message)
        }
        console.error('[ChangePassword] Erreur changement mot de passe:', e)
      } finally {
        isSubmitting.value = false
        console.log('[ChangePassword] Fin handleSubmit')
      }
    }

    return {
      oldPassword,
      newPassword,
      confirmPassword,
      error,
      isSubmitting,
      passwordMismatch,
      isFormValid,
      handleSubmit
    }
  }
})
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.card-title {
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  border-color: #4CAF50;
  outline: none;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}
</style>
