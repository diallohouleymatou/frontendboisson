<script setup lang="ts">
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = async () => {
  await UtilisateurService.logout()
  router.push('/login')
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <h1 class="app-title">Gestion Boisson</h1>
      <button class="logout-btn" @click="handleLogout">Déconnexion</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background: #4CAF50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}
.app-title {
  font-size: 1.5rem;
  font-weight: bold;
}
.logout-btn {
  background: #fff;
  color: #4CAF50;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #f2f2f2;
}
</style>