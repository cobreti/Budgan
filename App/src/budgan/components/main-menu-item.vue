<template>
  <button
    class="main-menu-item"
    :data-testid="testId"
    @click="emit('click')"
  >
    <v-icon class="main-menu-item__icon" :icon="icon" size="32" />
    <span class="main-menu-item__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  testId: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<style scoped>
@use '@/assets/colors-def.scss';

.main-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 8px;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
  cursor: pointer;
  transition: background-color 0.15s ease;
  width: 100%;
}

.main-menu-item:hover {
  background-color: var(--bdg-accent);
  color: var(--bdg-surface);
}

.main-menu-item__icon {
  pointer-events: none;
}

.main-menu-item__label {
  font-size: 0.8rem;
  text-align: center;
  pointer-events: none;
}
</style>

