<template>
  <form class="fournisseur-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="nom">Nom <span class="required">*</span></label>
      <input id="nom" v-model="form.nom" type="text" class="form-input" required placeholder="Nom du fournisseur" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="form.email" type="email" class="form-input" placeholder="Email du fournisseur" />
    </div>
    <div class="form-group">
      <label for="telephone">Téléphone</label>
      <input id="telephone" v-model="form.telephone" type="text" class="form-input" placeholder="Téléphone du fournisseur" />
    </div>
    <div class="form-group">
      <label for="adresse">Adresse</label>
      <input id="adresse" v-model="form.adresse" type="text" class="form-input" placeholder="Adresse du fournisseur" />
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Ajout...' : 'Créer' }}</button>
      <button class="btn btn-secondary" type="button" @click="$emit('cancel')">Annuler</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FournisseurService } from '../../features/fournisseur/services/fournisseurService';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['submit', 'cancel']);
const form = ref({ nom: '', email: '', telephone: '', adresse: '' });
const isSubmitting = ref(false);

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const fournisseur = await FournisseurService.ajouterFournisseur(form.value);
    ElMessage.success('Fournisseur créé avec succès !');
    emit('submit', fournisseur);
    form.value = { nom: '', email: '', telephone: '', adresse: '' };
  } catch (e) {
    ElMessage.error('Erreur lors de la création du fournisseur');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.fournisseur-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.btn-primary {
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #388e3c;
}
.btn-secondary {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover {
  background: #ccc;
}
.required {
  color: #d32f2f;
}
</style>

