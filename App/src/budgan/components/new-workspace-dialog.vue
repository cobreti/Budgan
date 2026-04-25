<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480px"
    data-testid="new-workspace-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="new-workspace-dialog">
      <v-card-title class="new-workspace-dialog__title">New Workspace</v-card-title>

      <v-card-text class="new-workspace-dialog__body">
        <v-text-field
          v-model="workspaceName"
          label="Name"
          autofocus
          variant="outlined"
          density="compact"
          data-testid="new-workspace-name-input"
          @keyup.enter="onCreate"
        />
      </v-card-text>

      <v-card-actions class="new-workspace-dialog__actions">
        <v-spacer />
        <v-btn
          variant="outlined"
          data-testid="new-workspace-cancel-btn"
          @click="onCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!workspaceName.trim()"
          :style="{ color: 'rgb(var(--v-theme-on-primary))' }"
          data-testid="new-workspace-create-btn"
          @click="onCreate"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const workspaceStore = useWorkspaceStore()
const workspaceName = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) workspaceName.value = ''
})

function onCancel(): void {
  emit('update:modelValue', false)
}

function onCreate(): void {
  const name = workspaceName.value.trim()
  if (!name) return
  workspaceStore.createWorkspace(name)
  emit('created')
  emit('update:modelValue', false)
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.new-workspace-dialog__title {
  padding-top: 1.25rem;
  color: var(--bdg-primary);
}

.new-workspace-dialog__body {
  padding-top: 1rem;
}

.new-workspace-dialog__actions {
  padding: 0.5rem 1rem 1rem;
  gap: 0.5rem;
}
</style>

