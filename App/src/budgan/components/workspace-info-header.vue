<template>
  <div
    v-if="workspaceStore.workspace"
    class="workspace-info-header"
    data-testid="workspace-info-header"
  >
    <div class="workspace-info-header__name-row">
      <span
        class="workspace-info-header__name"
        data-testid="workspace-info-header-name"
      >{{ workspaceStore.workspace.name }}</span>
      <button
        class="workspace-info-header__save-btn"
        :class="{ 'workspace-info-header__save-btn--saving': isSaving }"
        type="button"
        data-testid="workspace-info-header-save-btn"
        :aria-label="isSaving ? t('workspaceInfoHeader.saving') : t('workspaceInfoHeader.save')"
        :disabled="isSaving"
        @click="handleSave"
      >
        <v-icon :icon="isSaving ? 'mdi-loading' : 'mdi-content-save'" size="18" :class="{ 'workspace-info-header__save-btn-icon--spinning': isSaving }" />
      </button>
    </div>
    <span
      v-if="workspaceStore.workspacePath"
      class="workspace-info-header__path"
      data-testid="workspace-info-header-path"
    >{{ workspaceStore.workspacePath }}</span>
    <span
      v-if="saveError"
      class="workspace-info-header__save-error"
      data-testid="workspace-info-header-save-error"
    >{{ saveError }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

const isSaving = ref(false)
const saveError = ref<string | null>(null)

async function handleSave(): Promise<void> {
  isSaving.value = true
  saveError.value = null
  try {
    const result = await workspaceStore.saveWorkspace()
    if (!result.success && 'error' in result) {
      saveError.value = t('workspaceInfoHeader.saveError')
    }
  } finally {
    isSaving.value = false
  }
}
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

.workspace-info-header__name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.workspace-info-header__save-btn {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--bdg-on-primary);
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s, background-color 0.15s;

  &:hover:not(:disabled) {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.15);
  }

  &--saving {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.workspace-info-header__save-btn-icon--spinning {
  animation: spin 0.9s linear infinite;
}

.workspace-info-header__save-error {
  pointer-events: none;
  font-size: 0.65rem;
  color: var(--bdg-error);
}
</style>

