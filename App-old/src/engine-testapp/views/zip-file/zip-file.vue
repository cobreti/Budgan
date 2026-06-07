<template>
  <div class="zip-file-view">
    <h2 class="zip-file-view__title">{{ t('zipFile.title') }}</h2>
    <p class="zip-file-view__description">{{ t('zipFile.description') }}</p>

    <div class="zip-file-view__actions">
      <button
        class="zip-file-view__btn"
        :disabled="isLoading"
        data-testid="zip-file-load-btn"
        @click="onLoad"
      >
        {{ isLoading ? t('zipFile.loading') : t('zipFile.load') }}
      </button>
    </div>

    <p
      v-if="statusMessage"
      class="zip-file-view__status"
      :class="{ 'zip-file-view__status--error': isError }"
      data-testid="zip-file-status"
    >
      {{ statusMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'

  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const succeeded = ref(false)

  const isError = computed(() => errorMessage.value !== null)
  const statusMessage = computed(() => {
    if (errorMessage.value) return `${t('zipFile.errorPrefix')}${errorMessage.value}`
    if (succeeded.value) return t('zipFile.success')
    return null
  })

  const localeParam = computed(() => {
    const l = route.params.locale
    return typeof l === 'string' ? l : 'en'
  })

  async function onLoad(): Promise<void> {
    errorMessage.value = null
    succeeded.value = false

    let handle: FileSystemFileHandle
    try {
      ;[handle] = await (window as Window & typeof globalThis & {
        showOpenFilePicker(options?: unknown): Promise<FileSystemFileHandle[]>
      }).showOpenFilePicker({
        types: [{ description: 'Zip file', accept: { 'application/zip': ['.zip'] } }],
        multiple: false,
      })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      errorMessage.value = e instanceof Error ? e.message : 'Could not open file picker'
      return
    }

    isLoading.value = true
    const result = await workspaceStore.importWorkspaceFromZip(handle)
    isLoading.value = false

    if (!result.success) {
      errorMessage.value = result.error ?? 'Unknown error'
      return
    }

    succeeded.value = true
    router.push({ name: 'workspace-accounts', params: { locale: localeParam.value } })
  }
</script>

<style scoped>
  @use 'colors-def';

  .zip-file-view {
    display: grid;
    gap: 1rem;
    max-width: 36rem;
  }

  .zip-file-view__title {
    margin: 0;
  }

  .zip-file-view__description {
    margin: 0;
    color: var(--workspace-header-text);
  }

  .zip-file-view__actions {
    display: flex;
    gap: 0.75rem;
  }

  .zip-file-view__btn {
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--workspace-menu-item-border);
    border-radius: 0.5rem;
    background-color: var(--workspace-menu-item-background);
    color: var(--workspace-menu-item-text);
    font-weight: 600;
    cursor: pointer;
  }

  .zip-file-view__btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .zip-file-view__status {
    margin: 0;
    color: var(--workspace-menu-item-text);
  }

  .zip-file-view__status--error {
    color: var(--error-text, #c0392b);
  }
</style>
