<template>
  <div
    v-if="workspaceStore.workspace"
    class="workspace-info-header"
    data-testid="workspace-info-header"
  >
    <span
      class="workspace-info-header__name"
      data-testid="workspace-info-header-name"
    >{{ workspaceStore.workspace.name }}</span>
    <span
      v-if="workspaceStore.workspacePath"
      class="workspace-info-header__path"
      data-testid="workspace-info-header-path"
    >{{ workspaceStore.workspacePath }}</span>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const workspaceStore = useWorkspaceStore()
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.workspace-info-header {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;
}

.workspace-info-header__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bdg-on-primary);
}

.workspace-info-header__path {
  font-size: 0.65rem;
  opacity: 0.75;
  color: var(--bdg-on-primary);
}
</style>

