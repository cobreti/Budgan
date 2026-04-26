import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { BdgSettings, BdgSettingsImpl } from '@engine/modules/bdg-settings/bdg-settings'

export type SettingsStore = {
  settings: Ref<BdgSettings>
  reinitialize(): void
  setSettings(settings: BdgSettings): void
}

export const useSettingsStore = defineStore<string, SettingsStore>('budgan-settings', () => {
  const settings = ref<BdgSettings>(new BdgSettingsImpl())

  function reinitialize(): void {
    settings.value = new BdgSettingsImpl()
  }

  function setSettings(value: BdgSettings): void {
    settings.value = value
  }

  return {
    settings,
    reinitialize,
    setSettings,
  }
})

