<template>
  <form @submit.prevent="handleSubmit" class="utilisateur-form">
    <h2 class="form-title">{{ utilisateur ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}</h2>

    <div class="form-group">
      <label for="firstName">Prénom</label>
      <input
        type="text"
        id="firstName"
        v-model="formData.firstName"
        required
        placeholder="Entrez le prénom"
        class="form-input"
        :class="{ 'error': errors.firstName }"
      >
      <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
    </div>

    <div class="form-group">
      <label for="lastName">Nom</label>
      <input
        type="text"
        id="lastName"
        v-model="formData.lastName"
        required
        placeholder="Entrez le nom"
        class="form-input"
        :class="{ 'error': errors.lastName }"
      >
      <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        required
        placeholder="exemple@email.com"
        class="form-input"
        :class="{ 'error': errors.email }"
      >
      <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
    </div>

    <div class="form-group">
      <label for="role">Rôle</label>
      <select
        id="role"
        v-model="formData.role"
        required
        class="form-input"
        :class="{ 'error': errors.role }"
      >
        <option value="" disabled>Choisir un rôle</option>
        <option v-for="option in roleOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span class="error-message" v-if="errors.role">{{ errors.role }}</span>
    </div>

    <div class="form-group form-checkbox">
      <input
        type="checkbox"
        id="isActive"
        v-model="formData.isActive"
        class="form-checkbox-input"
      >
      <label for="isActive">Actif</label>
    </div>

    <div v-if="error" class="error-alert">
      {{ error }}
    </div>

    <button type="submit" class="form-submit-btn" :disabled="loading">
      <span v-if="loading" class="loader"></span>
      <span v-else>{{ utilisateur ? 'Modifier' : 'Ajouter' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur';
import { Role } from '../../features/utilisateurs/models/role';

const props = defineProps<{ utilisateur: Utilisateur | null }>();
const emit = defineEmits(['submit']);

const formData = ref<Partial<Utilisateur>>({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  isActive: true,
  ...props.utilisateur
});

const loading = ref(false);
const error = ref('');
const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: ''
});

watch(() => props.utilisateur, (newVal) => {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isActive: true,
    ...newVal
  };
});

const roleOptions = [
  { value: Role.GERANT, label: 'Gérant' },
  { value: Role.EMPLOYE, label: 'Employé' },
  { value: Role.LIVREUR, label: 'Livreur' },
];

const validateForm = (): boolean => {
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  };

  let isValid = true;

  if (!formData.value.firstName?.trim()) {
    errors.value.firstName = 'Le prénom est requis';
    isValid = false;
  }

  if (!formData.value.lastName?.trim()) {
    errors.value.lastName = 'Le nom est requis';
    isValid = false;
  }

  if (!formData.value.email?.trim()) {
    errors.value.email = 'L\'email est requis';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'L\'email n\'est pas valide';
    isValid = false;
  }

  if (!formData.value.role) {
    errors.value.role = 'Le rôle est requis';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    emit('submit', formData.value);
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.utilisateur-form {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #34495e;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-input.error {
  border-color: #e74c3c;
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
  margin-bottom: 1rem;
}

.form-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-checkbox-input {
  width: 18px;
  height: 18px;
  margin: 0;
}

.form-submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
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

.form-submit-btn:hover {
  background-color: #2980b9;
}

.form-submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
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
  .utilisateur-form {
    padding: 1.5rem;
  }

  .form-input {
    font-size: 16px;
  }
}
</style>