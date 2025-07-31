<template>
  <div class="login-container">
    <div class="login-card">
      <img src="" alt="Logo" class="logo" v-if="false"/>
      <h2>{{ isFirstLogin ? 'Changer le mot de passe' : 'Connexion' }}</h2>
      <!-- Login Form -->
      <form v-if="!isFirstLogin" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-group">
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              required
              :class="{ 'error': errors.email }"
              placeholder="Entrez votre email"
            />
          </div>
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="loginForm.motDePasse"
              required
              :class="{ 'error': errors.motDePasse }"
              placeholder="Entrez votre mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.motDePasse">{{ errors.motDePasse }}</span>
        </div>

        <button type="submit" :disabled="loading" class="submit-button">
          <span v-if="loading" class="loader"></span>
          <span v-else>Se connecter</span>
        </button>

        <div v-if="error" class="error-alert">
          {{ error }}
        </div>
      </form>

      <!-- Password Change Form -->
      <form v-else @submit.prevent="handlePasswordChange" class="login-form">
        <div class="form-group">
          <label for="oldPassword">Ancien mot de passe</label>
          <div class="input-group">
            <input
              :type="showOldPassword ? 'text' : 'password'"
              id="oldPassword"
              v-model="passwordForm.ancienMotDePasse"
              required
              :class="{ 'error': errors.ancienMotDePasse }"
              placeholder="Entrez votre ancien mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showOldPassword = !showOldPassword"
            >
              {{ showOldPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.ancienMotDePasse">{{ errors.ancienMotDePasse }}</span>
        </div>

        <div class="form-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <div class="input-group">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="passwordForm.nouveauMotDePasse"
              required
              :class="{ 'error': errors.nouveauMotDePasse }"
              placeholder="Entrez votre nouveau mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showNewPassword = !showNewPassword"
            >
              {{ showNewPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.nouveauMotDePasse">{{ errors.nouveauMotDePasse }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <div class="input-group">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirmez votre nouveau mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" :disabled="loading" class="submit-button">
          <span v-if="loading" class="loader"></span>
          <span v-else>Changer le mot de passe</span>
        </button>

        <div v-if="error" class="error-alert">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import { useRouter } from 'vue-router'
import type { LoginRequest } from '../features/utilisateurs/requests/loginRequest'
import type { PasswordRequest } from '../features/utilisateurs/requests/passwordRequest'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const isFirstLogin = ref(false)
    const confirmPassword = ref('')

    // Password visibility toggles
    const showPassword = ref(false)
    const showOldPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const loginForm = reactive<LoginRequest>({
      email: '',
      motDePasse: ''
    })

    const passwordForm = reactive<PasswordRequest>({
      ancienMotDePasse: '',
      nouveauMotDePasse: ''
    })

    const errors = reactive({
      email: '',
      motDePasse: '',
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
      confirmPassword: ''
    })

    const validateLoginForm = (): boolean => {
      let isValid = true
      errors.email = ''
      errors.motDePasse = ''

      if (!loginForm.email) {
        errors.email = 'L\'email est requis'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
        errors.email = 'Email invalide'
        isValid = false
      }

      if (!loginForm.motDePasse) {
        errors.motDePasse = 'Le mot de passe est requis'
        isValid = false
      }

      return isValid
    }

    const validatePasswordForm = (): boolean => {
      let isValid = true
      errors.ancienMotDePasse = ''
      errors.nouveauMotDePasse = ''
      errors.confirmPassword = ''

      if (!passwordForm.ancienMotDePasse) {
        errors.ancienMotDePasse = 'L\'ancien mot de passe est requis'
        isValid = false
      }

      if (!passwordForm.nouveauMotDePasse) {
        errors.nouveauMotDePasse = 'Le nouveau mot de passe est requis'
        isValid = false
      } else if (passwordForm.nouveauMotDePasse.length < 6) {
        errors.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères'
        isValid = false
      }

      if (passwordForm.nouveauMotDePasse !== confirmPassword.value) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        isValid = false
      }

      return isValid
    }

    const handleLogin = async () => {
      if (!validateLoginForm()) return

      loading.value = true
      error.value = ''

      try {
        const response = await UtilisateurService.login(loginForm)
        if (response.utilisateur.isFirstLogin) {
          isFirstLogin.value = true
          passwordForm.ancienMotDePasse = loginForm.motDePasse
          // Stocker le mot de passe pour préremplissage sur la page de changement
          localStorage.setItem('lastLoginPassword', loginForm.motDePasse)
        } else {
          router.push('/dashboard')
        }
      } catch (err: any) {
        error.value = err.message || 'Une erreur est survenue lors de la connexion'
      } finally {
        loading.value = false
      }
    }

    const handlePasswordChange = async () => {
      if (!validatePasswordForm()) return

      loading.value = true
      error.value = ''

      try {
        const user = UtilisateurService.getCurrentUser()
        const userId = user?.id
        await UtilisateurService.changePassword(userId, {
          ancienMotDePasse: passwordForm.ancienMotDePasse,
          nouveauMotDePasse: passwordForm.nouveauMotDePasse
        })
        router.push('/dashboard')
      } catch (err: any) {
        error.value = err.message || 'Une erreur est survenue lors du changement de mot de passe'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      // Initialize auth on component mount
      UtilisateurService.initializeAuth()
    })

    return {
      loginForm,
      passwordForm,
      confirmPassword,
      loading,
      error,
      errors,
      isFirstLogin,
      showPassword,
      showOldPassword,
      showNewPassword,
      showConfirmPassword,
      handleLogin,
      handlePasswordChange
    }
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
  max-width: 150px;
  height: auto;
}

.login-card h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

input.error {
  border-color: #e74c3c;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-alert {
  background-color: #fdeaea;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  margin-top: 1rem;
}

.submit-button {
  background-color: #3498db;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-button:hover {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  input {
    font-size: 16px; /* Prevents zoom on mobile */
  }
}
</style>
