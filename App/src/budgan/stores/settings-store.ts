import { defineStore } from 'pinia'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { PiniaPluginContext } from 'pinia'
import 'pinia-plugin-persistedstate'
import { BdgSettings, BdgSettingsImpl } from '@engine/modules/bdg-settings/bdg-settings'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import container from '@inversify/setup-inversify.ts'
import { BdgStorageService } from '@engine/modules/bdg-storage/bdg-storage.services.ts'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

/** Shape of the persisted + rehydrated state used in afterHydrate. */
type SettingsStoreHydrationState = {
  settings: BdgSettings
  columnMappingsSnapshot: BdgColumnMapping[]
}

export type SettingsStore = {
  settings: Ref<BdgSettings>
  columnMappings: Ref<BdgColumnMapping[]>
  // columnMappingsSnapshot: Ref<BdgColumnMapping[]>
  // reinitialize(): void
  // setSettings(settings: BdgSettings): void
  addColumnMapping(mapping: BdgColumnMapping): Promise<void>
  updateColumnMapping(mapping: BdgColumnMapping): Promise<void>
  removeColumnMapping(id: string): Promise<void>
}

export const useSettingsStore = defineStore('budgan-settings', () => {

  const workspaceStore = useWorkspaceStore();

  // if (!workspaceStore.workspace) {
  //   throw new Error('Workspace not initialized')
  // }

  let settings: Ref<BdgSettings> = ref(workspaceStore.workspace.settings);
  // const columnMappingsSnapshot = ref<BdgColumnMapping[]>([])
  let columnMappings: Ref<BdgColumnMapping[]> = ref([]);

  // if (settings != null) {
  //   settings.getColumnMappings().then((mappings) => {
  //     columnsMappingCache = mappings
  //   })
  // }

  // const columnMappings = computed(() => settings.value.columnMappings)

  // function _syncSnapshot(): void {
  //   columnMappingsSnapshot.value = [...settings.value.columnMappings]
  // }

  function reinitialize(): void {
    // settings.value = new BdgSettingsImpl()
    // columnMappingsSnapshot.value = []
  }

  // function setSettings(value: BdgSettings): void {
  //   settings.= value
  //   // _syncSnapshot()
  // }

  async function addColumnMapping(mapping: BdgColumnMapping): Promise<void> {
    if (settings.value) {
      await settings.value.addColumnMapping(mapping)
    }
    // _syncSnapshot()
  }

  async function updateColumnMapping(mapping: BdgColumnMapping): Promise<void> {
    if (settings.value) {
      await settings.value.updateColumnMapping(mapping)
    }
    // _syncSnapshot()
  }

  async function removeColumnMapping(id: string): Promise<void> {
    if (settings.value) {
      await settings.value.removeColumnMapping(id)
    }
    // _syncSnapshot()
  }

  return {
    settings,
    columnMappings,
    // columnMappingsSnapshot,
    // reinitialize,
    // setSettings,
    addColumnMapping,
    updateColumnMapping,
    removeColumnMapping,
  }
}, {
  // persist: {
  //   key: 'budgan-settings',
  //   storage: localStorage,
  //   pick: ['columnMappingsSnapshot'],
  //   afterHydrate: (ctx: PiniaPluginContext) => {
  //     const state = ctx.store.$state as SettingsStoreHydrationState
  //     for (const mapping of state.columnMappingsSnapshot) {
  //       state.settings.addColumnMapping(mapping)
  //     }
  //   },
  // },
})

