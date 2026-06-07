import { beforeEach, describe, expect, test, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AppHeader from './app-header.vue'

const push = vi.fn()
const route = { params: { locale: 'fr' as unknown } }
const toggleDrawer = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@budgan/stores/appSettings-store.ts', () => ({
  useAppSettingsStore: () => ({
    toggleDrawer,
  }),
}))

function mountHeader() {
  return shallowMount(AppHeader, {
    global: {
      stubs: {
        WorkspaceInfoHeader: true,
        VAppBar: {
          template: '<div><slot name="prepend" /><slot name="title" /><slot /></div>',
        },
        VAppBarNavIcon: {
          template: '<button @click="$emit(\'click\')" />',
        },
      },
    },
  })
}

describe('AppHeader', () => {
  beforeEach(() => {
    push.mockReset()
    toggleDrawer.mockReset()
    route.params.locale = 'fr'
  })

  test('clicking app title navigates to localized home route', async () => {
    const wrapper = mountHeader()

    await wrapper.get('[data-testid="app-header-title"]').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'home', params: { locale: 'fr' } })
  })
})
