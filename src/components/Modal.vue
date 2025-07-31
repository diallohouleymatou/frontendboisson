<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlay">
        <div class="modal-wrapper" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('update:modelValue', false)">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  closeOnOutsideClick?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const closeOnOverlay = (event: MouseEvent) => {
  if (props.closeOnOutsideClick !== false) {
    emit('update:modelValue', false)
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    emit('update:modelValue', false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-wrapper {
  background: linear-gradient(135deg, #f8fafc 60%, #e3f0ff 100%);
  border-radius: 16px;
  width: 95%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(66,133,244,0.18), 0 1.5px 8px rgba(52,168,83,0.08);
  animation: modal-pop 0.22s cubic-bezier(.4,1.3,.6,1) both;
  border: 1.5px solid #4285f4;
}

@keyframes modal-pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 12px 24px;
  border-bottom: 1px solid #e3eaf5;
  background: linear-gradient(90deg, #e3f0ff 60%, #f8fafc 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4285f4;
  margin: 0;
  letter-spacing: 0.5px;
}

.modal-close {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover {
  background: #e3f0ff;
}

.modal-body {
  padding: 20px 24px 24px 24px;
  background: transparent;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

@media (max-width: 600px) {
  .modal-wrapper {
    max-width: 98vw;
    padding: 0;
  }
  .modal-header, .modal-body {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
