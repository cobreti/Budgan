import { defineStore } from 'pinia'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { PiniaPluginContext } from 'pinia'
import 'pinia-plugin-persistedstate'
import { BdgSettings, BdgSettingsImpl } from '@engine/modules/bdg-settings/bdg-settings'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import container from '@inversify/setup-inversify.ts'
import { BdgStorageService } from '@engine/modules/bdg-storage/bdg-storage.services.ts'

/** Shape of the persisted + rehydrated state used in afterHydrate. */
type SettingsStoreHydrationState = {
  settings: BdgSettings
  columnMappingsSnapshot: BdgColumnMapping[]
}

export type SettingsStore = {
  settings: Ref<BdgSettings>
  columnMappings: ComputedRef<BdgColumnMapping[]>
  columnMappingsSnapshot: Ref<BdgColumnMapping[]>
  reinitialize(): void
  setSettings(settings: BdgSettings): void
  addColumnMapping(mapping: BdgColumnMapping): void
  updateColumnMapping(mapping: BdgColumnMapping): void
  removeColumnMapping(id: string): void
}

export const useSettingsStore = defineStore('budgan-settings', () => {

  const bdgStorageService: BdgStorageService = container.get<BdgStorageService>(
    BdgStorageService.bindingTypeId
  )

  const settings = ref<BdgSettings>(new BdgSettingsImpl())
  const columnMappingsSnapshot = ref<BdgColumnMapping[]>([])

  const columnMappings = computed(() => settings.value.columnMappings)

  function _syncSnapshot(): void {
    columnMappingsSnapshot.value = [...settings.value.columnMappings]
  }

  function reinitialize(): void {
    settings.value = new BdgSettingsImpl()
    columnMappingsSnapshot.value = []
  }

  function setSettings(value: BdgSettings): void {
    settings.value = value
    _syncSnapshot()
  }

  function addColumnMapping(mapping: BdgColumnMapping): void {

    const storageService = bdgStorageService.getSettingsService().saveColumnMapping(mapping);

    settings.value.addColumnMapping(mapping)
    _syncSnapshot()
  }

  function updateColumnMapping(mapping: BdgColumnMapping): void {
    settings.value.updateColumnMapping(mapping)
    _syncSnapshot()
  }

  function removeColumnMapping(id: string): void {
    settings.value.removeColumnMapping(id)
    _syncSnapshot()
  }

  return {
    settings,
    columnMappings,
    columnMappingsSnapshot,
    reinitialize,
    setSettings,
    addColumnMapping,
    updateColumnMapping,
    removeColumnMapping,
  }
}, {
  persist: {
    key: 'budgan-settings',
    storage: localStorage,
    pick: ['columnMappingsSnapshot'],
    afterHydrate: (ctx: PiniaPluginContext) => {
      const state = ctx.store.$state as SettingsStoreHydrationState
      for (const mapping of state.columnMappingsSnapshot) {
        state.settings.addColumnMapping(mapping)
      }
    },
  },
})

