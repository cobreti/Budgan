import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { BdgSettings } from '../../engine/modules/bdg-settings/bdg-settings'
import type { BdgColumnMapping } from '../../engine/modules/bdg-settings/bdg-column-mapping'
import container from '../../inversify/setup-inversify'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const settings = ref<BdgSettings>(container.get<BdgSettings>(BdgSettings.bindingTypeId))

    const columnMappings = computed(() => settings.value.columnMappings)

    function updateMapping(mapping: BdgColumnMapping): void {
      settings.value.updateColumnMapping(mapping)
    }

    function insertMapping(mapping: BdgColumnMapping): void {
      settings.value.addColumnMapping(mapping)
    }

    return {
      settings,
      columnMappings,
      updateMapping,
      insertMapping
    }
  },
  {
    persist: {
      key: 'engine-testapp-settings',
      storage: localStorage
    }
  }
)
