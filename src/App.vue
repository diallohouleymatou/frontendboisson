<template>
  <div id="app" class="app-layout">
    <SideBar :is-collapsed="sidebarCollapsed" />
    <main class="app-main">
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
  display: flex;
  min-height: 100vh;
  background: #f2f2f2;
}

.app-main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 0.3s;
  background: #f2f2f2;
}

.main-content {
  padding: 32px 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
@media (max-width: 900px) {
  .app-main {
    margin-left: 0;
  }
  .main-content {
    padding: 16px 4px;
  }
}
</style>