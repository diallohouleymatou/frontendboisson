<template>
  <aside v-if="shouldShowSidebar" class="app-sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav-list nav-list-large">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active">
              <ChartBarSquareIcon class="nav-icon" />
              <span class="nav-text">Tableau de bord</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/boisson" class="nav-link" active-class="active">
              <SparklesIcon class="nav-icon" />
              <span class="nav-text">Boissons</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/lot" class="nav-link" active-class="active">
              <CubeIcon class="nav-icon" />
              <span class="nav-text">Lots et Batches</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/mouvement" class="nav-link" active-class="active">
              <ArrowPathIcon class="nav-icon" />
              <span class="nav-text">Mouvements</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/operation" class="nav-link" active-class="active">
              <DocumentTextIcon class="nav-icon" />
              <span class="nav-text">Opérations</span>
            </router-link>
          </li>
          <li class="nav-item" v-if="isGerant">
            <router-link to="/utilisateur" class="nav-link" active-class="active">
              <IdentificationIcon class="nav-icon" />
              <span class="nav-text">Utilisateurs</span>
            </router-link>
          </li>
          <li class="nav-item" v-if="isGerant">
            <router-link to="/analyse" class="nav-link" active-class="active">
              <ChartPieIcon class="nav-icon" />
              <span class="nav-text">Analyses</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/fournisseur" class="nav-link" active-class="active">
              <UserGroupIcon class="nav-icon" />
              <span class="nav-text">Fournisseurs</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    <div class="sidebar-footer">
      <div class="footer-content">
        <button class="logout-btn" @click="handleLogout">Déconnexion</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import {
  ChartBarSquareIcon,
  SparklesIcon,
  CubeIcon,
  ArrowPathIcon,
  IdentificationIcon,
  ChartPieIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

interface Props {
  isCollapsed: boolean
}

defineProps<Props>()

const router = useRouter()
const route = useRoute()
const handleLogout = async () => {
  await UtilisateurService.logout()
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
  position: fixed;
  top: var(--layout-header-height);
  left: 0;
  bottom: 0;
  width: var(--layout-sidebar-width);
  background: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-light);
  z-index: 900;
  transition: all var(--transition-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.app-sidebar.collapsed {
  width: var(--layout-sidebar-collapsed-width);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-6) 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  list-style: none;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 1.18rem;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  margin-right: var(--space-2);
}

.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  transform: translateX(2px);
}

.nav-link.active {
  color: var(--color-primary-600);
  background: var(--color-primary-50);
  font-weight: var(--font-weight-semibold);
}

.nav-icon {
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.nav-link:hover .nav-icon {
  transform: scale(1.05);
}

.nav-link.active .nav-icon {
  color: var(--color-primary-600);
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--transition-fast);
  font-size: 1.18rem;
}

.collapsed .nav-text {
  opacity: 0;
  visibility: hidden;
  width: 0;
}

.sidebar-footer {
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.version-icon {
  flex-shrink: 0;
}

.version-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.collapsed .version-text {
  display: none;
}

.footer-actions {
  display: flex;
  gap: var(--space-2);
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.footer-btn:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  transform: translateY(-1px);
}

.logout-btn {
  margin-top: 1.5rem;
  width: 100%;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #388e3c;
}

@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }

  .app-sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .app-sidebar.collapsed {
    transform: translateX(-100%);
  }
}

.sidebar-content::-webkit-scrollbar {
  width: 3px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--color-border-medium);
  border-radius: var(--radius-full);
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-dark);
}

.collapsed .nav-link {
  position: relative;
}

.collapsed .nav-link:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-md);
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
</style>