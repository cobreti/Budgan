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
        <v-select
          v-model="selectedMappingId"
          :label="t('accounts.columnMappingLabel')"
          :items="mappingItems"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="compact"
          data-testid="add-account-mapping-select"
          @update:model-value="onMappingChange"
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
          :disabled="!canAdd"
          :style="{ color: 'rgb(var(--v-theme-on-primary))' }"
          data-testid="add-account-submit-btn"
          @click="onAdd"
        >
          {{ t('accounts.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ColumnMappingDialog v-model="showColumnMappingDialog" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import { useSettingsStore } from '@budgan/stores/settings-store.ts'
import ColumnMappingDialog from '@budgan/components/column-mapping-dialog.vue'

const CREATE_NEW_ID = '__create_new__'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
const settingsStore = useSettingsStore()
const accountName = ref('')
const selectedMappingId = ref('')
const showColumnMappingDialog = ref(false)
const savedMappingCountBefore = ref(0)

const mappingItems = computed(() => [
  ...settingsStore.settings.columnMappings,
  { id: CREATE_NEW_ID, name: t('accounts.createNewMapping') },
])

const canAdd = computed(() =>
  accountName.value.trim() !== '' &&
  selectedMappingId.value !== '' &&
  selectedMappingId.value !== CREATE_NEW_ID
)

watch(() => props.modelValue, (open) => {
  if (!open) {
    accountName.value = ''
    selectedMappingId.value = ''
  }
})

// Auto-select a newly created mapping when the column mapping dialog closes
watch(showColumnMappingDialog, (open) => {
  if (!open) {
    const mappings = settingsStore.settings.columnMappings
    if (mappings.length > savedMappingCountBefore.value) {
      selectedMappingId.value = mappings[mappings.length - 1].id
    }
  }
})

function onMappingChange(id: string): void {
  if (id === CREATE_NEW_ID) {
    selectedMappingId.value = ''
    savedMappingCountBefore.value = settingsStore.settings.columnMappings.length
    showColumnMappingDialog.value = true
  }
}

function onCancel(): void {
  emit('update:modelValue', false)
}

function onAdd(): void {
  const name = accountName.value.trim()
  if (!canAdd.value || !workspaceStore.workspace) return
  workspaceStore.workspace.createAccount(name, selectedMappingId.value)
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
  display: grid;
  gap: 0.25rem;
}

.add-account__actions {
  padding: 0.5rem 1rem 1rem;
  gap: 0.5rem;
}
</style>

