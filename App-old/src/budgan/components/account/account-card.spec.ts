import { beforeEach, describe, expect, test, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AccountCard from './account-card.vue'
import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'

const route = {
  params: { locale: 'fr' as unknown },
}

const removeAccount = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, n?: number) => (key === 'accounts.segments' ? `${n}` : key),
  }),
}))

vi.mock('@budgan/stores/workspace-store.ts', () => ({
  useWorkspaceStore: () => ({
    removeAccount,
  }),
}))

const account = {
  id: 'acc-1',
  name: 'Main account',
  columnMappingId: 'mapping-1',
  segments: [{ id: 'seg-1' }],
} as unknown as BdgAccount

function mountCard() {
  return shallowMount(AccountCard, {
    props: {
      account,
    },
    global: {
      stubs: {
        VCard: {
          props: ['to'],
          template: '<a data-testid="account-card-link" :data-to="JSON.stringify(to)"><slot /></a>',
        },
        VCardText: {
          template: '<div><slot /></div>',
        },
        VBtn: {
          inheritAttrs: false,
          template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)" />',
        },
      },
    },
  })
}

describe('AccountCard', () => {
  beforeEach(() => {
    removeAccount.mockReset()
    route.params.locale = 'fr'
  })

  test('renders delete button on the right action slot with localized label', () => {
    const wrapper = mountCard()
    const deleteButton = wrapper.get('[data-testid="account-card-delete-acc-1"]')

    expect(deleteButton.attributes('aria-label')).toBe('accounts.delete')
    expect(deleteButton.classes()).toContain('account-card__delete')
  })

  test('clicking delete button removes account without bubbling to card click', async () => {
    const wrapper = mountCard()
    const cardClickListener = vi.fn()
    wrapper.get('[data-testid="account-card-acc-1"]').element.addEventListener('click', cardClickListener)

    await wrapper.get('[data-testid="account-card-delete-acc-1"]').trigger('click')

    expect(removeAccount).toHaveBeenCalledWith('acc-1')
    expect(cardClickListener).not.toHaveBeenCalled()
  })

  test('builds account route using current locale', () => {
    const wrapper = mountCard()
    const routePayload = wrapper.get('[data-testid="account-card-acc-1"]').attributes('data-to')

    expect(routePayload).toContain('"locale":"fr"')
    expect(routePayload).toContain('"accountId":"acc-1"')
  })
})