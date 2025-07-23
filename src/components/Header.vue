<template>
  <header class="header">
    <div class="header-content">
      <div class="header-actions">
        <div class="user-info">
          <span class="user-welcome">Bienvenue</span>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Se déconnecter">
          <span class="logout-icon">🚪</span>
          Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { UtilisateurService } from '../features/utilisateurs/services/utilisateurService'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['toggle-sidebar'])

const handleLogout = async () => {
  await UtilisateurService.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--layout-header-height);
  background: var(--color-bg-primary, #ffffff);
  color: var(--color-text-primary, #1f2937);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all var(--transition-base, 0.3s ease);
}

.header-content {
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--layout-content-padding, 2rem);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  opacity: 0.9;
}

.user-welcome {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logout-btn:hover {
  background: var(--color-primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  .user-info {
    display: none;
  }
  .logout-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  .logout-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .logout-btn {
    padding: 0.5rem 0.75rem;
    min-width: auto;
  }
}
</style>