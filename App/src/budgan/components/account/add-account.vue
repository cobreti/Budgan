<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480px"
    data-testid="add-account-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="add-account">
      <v-card-title class="add-account__title">{{ t('accounts.addAccount') }}</v-card-title>

      <v-card-text class="add-account__body">
        <v-text-field
          v-model="accountName"
          :label="t('accounts.accountNameLabel')"
          autofocus
          variant="outlined"
          density="compact"
          data-testid="add-account-name-input"
          @keyup.enter="onAdd"
        />
      </v-card-text>

      <v-card-actions class="add-account__actions">
        <v-spacer />
        <v-btn
          variant="outlined"
          data-testid="add-account-cancel-btn"
          @click="onCancel"
        >
          {{ t('accounts.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!accountName.trim()"
          :style="{ color: 'rgb(var(--v-theme-on-primary))' }"
          data-testid="add-account-submit-btn"
          @click="onAdd"
        >
          {{ t('accounts.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
const accountName = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) accountName.value = ''
})

function onCancel(): void {
  emit('update:modelValue', false)
}

function onAdd(): void {
  const name = accountName.value.trim()
  if (!name || !workspaceStore.workspace) return
  workspaceStore.workspace.createAccount(name, '')
  emit('created')
  emit('update:modelValue', false)
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.add-account__title {
  padding-top: 1.25rem;
  color: var(--bdg-primary);
}

.add-account__body {
  padding-top: 1rem;
}

.add-account__actions {
  padding: 0.5rem 1rem 1rem;
  gap: 0.5rem;
}
</style>

