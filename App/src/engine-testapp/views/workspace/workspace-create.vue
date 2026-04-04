<template>
  <section class="workspace-create" data-testid="workspace-create-view">
    <h3 class="workspace-create__title">{{ t('workspace.create.title') }}</h3>
    <p class="workspace-create__description">{{ t('workspace.create.description') }}</p>
    <p class="workspace-create__note">{{ t('workspace.create.singleWorkspaceNotice') }}</p>

    <div class="workspace-create__current" data-testid="workspace-create-current">
      <p class="workspace-create__current-title">{{ t('workspace.create.currentWorkspace') }}</p>
      <p v-if="workspaceStore.currentWorkspace" class="workspace-create__current-value">
        {{ workspaceStore.currentWorkspace.name }} ({{ workspaceStore.currentWorkspace.id }})
      </p>
      <p v-else class="workspace-create__current-empty">
        {{ t('workspace.create.currentWorkspaceEmpty') }}
      </p>
      <button
        v-if="workspaceStore.currentWorkspace"
        class="workspace-create__remove-button"
        type="button"
        data-testid="workspace-create-remove-current"
        @click="removeCurrentWorkspace"
      >
        {{ t('workspace.create.removeCurrent') }}
      </button>
    </div>

    <form class="workspace-create__form" @submit.prevent="createWorkspace">
      <label class="workspace-create__label" for="workspace-name">
        {{ t('workspace.create.nameLabel') }}
      </label>
      <input
        id="workspace-name"
        v-model="workspaceName"
        class="workspace-create__input"
        data-testid="workspace-create-name"
        type="text"
        :placeholder="t('workspace.create.namePlaceholder')"
      />

      <p v-if="errorMessage" class="workspace-create__error" data-testid="workspace-create-error">
        {{ errorMessage }}
      </p>
      <p
        v-if="createdWorkspaceId"
        class="workspace-create__success"
        data-testid="workspace-create-success"
      >
        {{ t('workspace.create.success', { workspaceId: createdWorkspaceId }) }}
      </p>

      <button class="workspace-create__button" type="submit" data-testid="workspace-create-submit">
        {{ t('workspace.create.submit') }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import container from '../../../inversify/setup-inversify'
  import { BdgWorkspaceFactory } from '../../../engine/modules/bdg-workspace/bdg-workspace-factory'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()

  const workspaceName = ref('')
  const createdWorkspaceId = ref<string | null>(null)
  const errorMessage = ref('')

  function createWorkspace(): void {
    const trimmedWorkspaceName = workspaceName.value.trim()

    if (!trimmedWorkspaceName) {
      createdWorkspaceId.value = null
      errorMessage.value = t('workspace.create.nameRequired')
      return
    }

    try {
      const workspaceFactory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)
      const workspace = workspaceFactory.createWorkspace()
      workspace.name = trimmedWorkspaceName
      workspaceStore.setCurrentWorkspace(workspace)

      createdWorkspaceId.value = workspace.id
      errorMessage.value = ''
      workspaceName.value = ''
    } catch {
      createdWorkspaceId.value = null
      errorMessage.value = t('workspace.create.error')
    }
  }

  function removeCurrentWorkspace(): void {
    workspaceStore.setCurrentWorkspace(null)
    createdWorkspaceId.value = null
    workspaceName.value = ''
    errorMessage.value = t('workspace.create.removed')
  }
</script>

<style scoped>
  .workspace-create {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-create__title,
  .workspace-create__description {
    margin: 0;
  }

  .workspace-create__description {
    color: var(--workspace-on-surface-variant);
  }

  .workspace-create__note {
    margin: 0;
    color: var(--workspace-on-surface-variant);
  }

  .workspace-create__current {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding: 0.75rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface);
  }

  .workspace-create__current-title,
  .workspace-create__current-value,
  .workspace-create__current-empty {
    margin: 0;
  }

  .workspace-create__current-title {
    font-weight: 600;
    color: var(--workspace-on-surface);
  }

  .workspace-create__current-value {
    color: var(--workspace-on-surface);
  }

  .workspace-create__current-empty {
    color: var(--workspace-on-surface-variant);
  }

  .workspace-create__form {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-create__label {
    font-weight: 600;
    color: var(--workspace-on-surface);
  }

  .workspace-create__input {
    min-height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
  }

  .workspace-create__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 999px;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
    cursor: pointer;
  }

  .workspace-create__remove-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.55rem 1rem;
    border: 1px solid var(--workspace-error);
    border-radius: 999px;
    background-color: var(--workspace-error-low-emphasis);
    color: var(--workspace-error);
    font: inherit;
    cursor: pointer;
    justify-self: start;
  }

  .workspace-create__error,
  .workspace-create__success {
    margin: 0;
  }

  .workspace-create__error {
    color: var(--workspace-error);
  }

  .workspace-create__success {
    color: var(--workspace-success);
  }

  @media (max-width: 640px) {
    .workspace-create__button,
    .workspace-create__remove-button {
      width: 100%;
    }
  }
</style>
