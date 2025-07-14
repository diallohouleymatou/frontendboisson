<template>
  <form @submit.prevent="handleSubmit" class="utilisateur-form">
    <h2 class="form-title">{{ utilisateur ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}</h2>
    <div class="form-group">
      <label for="nom">Nom</label>
      <input type="text" id="nom" v-model="formData.nom" required placeholder="Entrez le nom" class="form-input">
    </div>
    <div class="form-group">
      <label for="prenom">Prénom</label>
      <input type="text" id="prenom" v-model="formData.prenom" required placeholder="Entrez le prénom" class="form-input">
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" v-model="formData.email" required placeholder="exemple@email.com" class="form-input">
    </div>
    <div class="form-group">
      <label for="role">Rôle</label>
      <select id="role" v-model="formData.role" required class="form-input">
        <option value="" disabled>Choisir un rôle</option>
        <option v-for="option in roleOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="form-group form-checkbox">
      <input type="checkbox" id="isActive" v-model="formData.isActive" class="form-checkbox-input">
      <label for="isActive">Actif</label>
    </div>
    <button type="submit" class="form-submit-btn">{{ utilisateur ? 'Modifier' : 'Ajouter' }}</button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import type { Utilisateur } from '../../features/utilisateurs/models/utilisateur';
import { Role } from '../../features/utilisateurs/models/role';

const props = defineProps<{ utilisateur: Utilisateur | null }>();
const emit = defineEmits(['submit']);

const formData = ref<Partial<Utilisateur>>({ ...props.utilisateur });

watch(() => props.utilisateur, (newVal) => {
  formData.value = { ...newVal };
});

const roleOptions = [
  { value: Role.GERANT, label: 'Gérant' },
  { value: Role.EMPLOYE, label: 'Employé' },
  { value: Role.LIVREUR, label: 'Livreur' },
];

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<style scoped>
.utilisateur-form {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 #0001;
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
.form-input {
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.2s;
}
.form-input:focus {
  border-color: #409eff;
  outline: none;
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
}
.form-submit-btn {
  width: 100%;
  padding: 0.7rem 0;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.form-submit-btn:hover {
  background: #2563eb;
}
</style>