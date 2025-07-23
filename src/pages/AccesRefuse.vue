<template>
  <div class="access-denied-container">
    <h1>Accès refusé</h1>
    <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
    <router-link to="/dashboard" class="btn btn-primary">Retour à l'accueil</router-link>
  </div>
</template>

<script setup lang="ts">
// Pas de logique spécifique
</script>

<style scoped>
.access-denied-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  text-align: center;
}
h1 {
  color: #d32f2f;
  margin-bottom: 1rem;
}
p {
  margin-bottom: 2rem;
  color: #555;
}
.btn {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: #1976d2;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}
.btn:hover {
  background: #1565c0;
}
</style>

