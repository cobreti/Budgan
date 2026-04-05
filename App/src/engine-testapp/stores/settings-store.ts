import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import container from '@inversify/setup-inversify'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const settings = ref<BdgSettings>(container.get<BdgSettings>(BdgSettings.bindingTypeId))
    const columnMappingsSnapshot = ref<BdgColumnMapping[]>([])

    const columnMappings = computed(() => settings.value.columnMappings)

    function updateMapping(mapping: BdgColumnMapping): void {
      settings.value.updateColumnMapping(mapping)
      columnMappingsSnapshot.value = [...settings.value.columnMappings]
    }

    function insertMapping(mapping: BdgColumnMapping): void {
      settings.value.addColumnMapping(mapping)
      columnMappingsSnapshot.value = [...settings.value.columnMappings]
    }

    function removeMapping(id: string): void {
      settings.value.removeColumnMapping(id)
      columnMappingsSnapshot.value = [...settings.value.columnMappings]
    }

    return {
      settings,
      columnMappings,
      columnMappingsSnapshot,
      updateMapping,
      insertMapping,
      removeMapping,
    }
  },
  {
    persist: {
      key: 'engine-testapp-settings',
      storage: localStorage,
      pick: ['columnMappingsSnapshot'],
      afterHydrate: (ctx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = ctx.store as any
        const snapshot = store.columnMappingsSnapshot as BdgColumnMapping[]
        for (const mapping of snapshot) {
          store.settings.addColumnMapping(mapping)
        }
      },
    },
  },
)
