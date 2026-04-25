<template>
  <section class="page-layout">
    <header class="page-layout__header">
      <p>{{ description }}</p>
    </header>

    <div class="page-layout__layout">
      <aside class="page-layout__menu" :aria-label="navLabel">
        <ul class="page-layout__menu-list">
          <slot name="menu" />
        </ul>
      </aside>

      <div class="page-layout__panel">
        <RouterView />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    description: string
    navLabel: string
  }>()
</script>

<style scoped>
  @use 'colors-def';

  .page-layout {
    display: grid;
    gap: 1.5rem;
    max-width: 72rem;
  }

  .page-layout__header {
    display: grid;
    gap: 0.5rem;
  }

  .page-layout__header p {
    margin: 0;
    color: var(--workspace-header-text);
  }

  .page-layout__layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .page-layout__menu {
    border: 1px solid var(--workspace-menu-border);
    border-radius: 1rem;
    background-color: var(--workspace-menu-background);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
    padding: 1rem;
  }

  .page-layout__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.625rem;
  }

  :slotted(.page-layout__menu-item) {
    display: block;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--workspace-menu-item-border);
    border-radius: 0.625rem;
    color: var(--workspace-menu-item-text);
    background-color: var(--workspace-menu-item-background);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  :slotted(.page-layout__menu-item--active) {
    border-color: var(--workspace-menu-item-active-border);
    background-color: var(--workspace-menu-item-active-background);
    color: var(--workspace-menu-item-active-text);
  }

  :slotted(.page-layout__menu-item--disabled) {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .page-layout__panel {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--workspace-panel-border);
    border-radius: 1rem;
    background-color: var(--workspace-panel-background);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
  }

  @media (max-width: 640px) {
    .page-layout__layout {
      grid-template-columns: 1fr;
    }

    .page-layout__menu {
      padding: 0.875rem;
    }
  }
</style>
