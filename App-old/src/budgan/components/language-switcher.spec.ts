import { beforeEach, describe, expect, test, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import LanguageSwitcher from './language-switcher.vue'

const push = vi.fn()
const route = {
  name: 'account-transactions' as string | undefined,
  params: { locale: 'fr' as unknown, accountId: 'acc-1' },
  query: { duplicate: '1' },
  hash: '#table',
}

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}))

function mountSwitcher() {
  return shallowMount(LanguageSwitcher, {
    global: {
      stubs: {
        VSelect: {
          props: ['modelValue', 'items'],
          template: `
            <select
              data-testid="language-switcher-select"
              :value="modelValue"
              @change="$emit('update:modelValue', $event.target.value)"
            >
              <option v-for="item in items" :key="item" :value="item">{{ item }}</option>
            </select>
          `,
        },
      },
    },
  })
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    push.mockReset()
    route.name = 'account-transactions'
    route.params.locale = 'fr'
    route.params.accountId = 'acc-1'
    route.query = { duplicate: '1' }
    route.hash = '#table'
  })

  test('shows only locale codes and selects the current locale', () => {
    const wrapper = mountSwitcher()
    const select = wrapper.get('[data-testid="language-switcher-select"]')
    const options = wrapper.findAll('option').map((o) => o.text())

    expect((select.element as HTMLSelectElement).value).toBe('fr')
    expect(options).toEqual(['en', 'fr'])
  })

  test('switching language keeps current route context and updates locale', async () => {
    const wrapper = mountSwitcher()

    await wrapper.get('[data-testid="language-switcher-select"]').setValue('en')

    expect(push).toHaveBeenCalledWith({
      name: 'account-transactions',
      params: { locale: 'en', accountId: 'acc-1' },
      query: { duplicate: '1' },
      hash: '#table',
    })
  })

  test('falls back to localized home when current route has no name', async () => {
    route.name = undefined
    const wrapper = mountSwitcher()

    await wrapper.get('[data-testid="language-switcher-select"]').setValue('en')

    expect(push).toHaveBeenCalledWith({ name: 'home', params: { locale: 'en' } })
  })
})
