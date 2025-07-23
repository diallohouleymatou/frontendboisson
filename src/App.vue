<template>
  <div id="app" class="app-layout">
    <SideBar :is-collapsed="sidebarCollapsed" />

    <main class="app-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="main-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SideBar from "./components/SideBar.vue";

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.app-main {
  margin-left: var(--layout-sidebar-width);
  margin-top: 0;
  transition: margin-left var(--transition-base);
  min-height: 100vh;
}

.app-main.sidebar-collapsed {
  margin-left: var(--layout-sidebar-collapsed-width);
}

.main-content {
  padding: var(--layout-content-padding);
  max-width: var(--layout-max-width);
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
  }

  .app-main.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>