<template>
  <aside v-if="shouldShowSidebar" class="app-sidebar">
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active">
              <span class="nav-text">Tableau de bord</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/boisson" class="nav-link" active-class="active">
              <span class="nav-text">Boissons</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/lot" class="nav-link" active-class="active">
              <span class="nav-text">Lots</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/mouvement" class="nav-link" active-class="active">
              <span class="nav-text">Mouvements</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/operation" class="nav-link" active-class="active">
              <span class="nav-text">Opérations</span>
            </router-link>
          </li>
          <li class="nav-item" v-if="isGerant">
            <router-link to="/utilisateur" class="nav-link" active-class="active">
              <span class="nav-text">Utilisateurs</span>
            </router-link>
          </li>
          <li class="nav-item" v-if="isGerant">
            <router-link to="/analyse" class="nav-link" active-class="active">
              <span class="nav-text">Analyses</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/fournisseur" class="nav-link" active-class="active">
              <span class="nav-text">Fournisseurs</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    <div class="sidebar-logout">
      <button class="logout-btn" @click="handleLogout">Se déconnecter</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'

interface Props {
  isCollapsed: boolean
}

defineProps<Props>()

const router = useRouter()
const route = useRoute()
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const user = computed(() => UtilisateurService.getCurrentUser())
const isAuthenticated = computed(() => UtilisateurService.isAuthenticated())
const isGerant = computed(() => user.value?.role === 'GERANT')

const hiddenSidebarRoutes = ['login', 'change-password']
const shouldShowSidebar = computed(() => {
  return isAuthenticated.value && !hiddenSidebarRoutes.includes(route.name as string)
})
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  min-width: 220px;
  background: #fff;
  color: #333;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex: 1;
  padding: 32px 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-nav {
  flex: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 8px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  background: #e0e0e0;
  color: #4285f4;
}

.nav-icon {
  font-size: 1.1em;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logout {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #4285f4;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #357ae8;
}

@media (max-width: 900px) {
  .app-sidebar {
    position: static;
    width: 100%;
    min-width: 0;
    box-shadow: none;
  }

  .sidebar-content {
    padding: 8px 0;
  }
}

</style>
