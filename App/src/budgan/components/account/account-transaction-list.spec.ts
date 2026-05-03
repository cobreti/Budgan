import { describe, expect, test, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AccountTransactionList from './account-transaction-list.vue'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const segment = {
  id: 'seg-1',
  name: 'Segment 1',
  dateStartAsString: '2024-01-05',
  dateEndAsString: '2024-03-10',
  dateStart: new Date('2024-01-05T00:00:00.000Z'),
  dateEnd: new Date('2024-03-10T00:00:00.000Z'),
  rows: [
    {
      key: 'row-card-2',
      cardNumber: 'CARD-2',
      description: 'Coffee',
      dateInscriptionAsString: '2024-01-05',
      dateInscription: new Date('2024-01-05T00:00:00.000Z'),
      amount: 20,
    },
    {
      key: 'row-card-1',
      cardNumber: 'CARD-1',
      description: 'Groceries',
      dateInscriptionAsString: '2024-03-10',
      dateInscription: new Date('2024-03-10T00:00:00.000Z'),
      amount: -5,
    },
    {
      key: 'row-card-3-duplicate',
      cardNumber: 'CARD-3',
      description: 'Books',
      dateInscriptionAsString: '2024-02-15',
      dateInscription: new Date('2024-02-15T00:00:00.000Z'),
      amount: 10,
      duplicateOf: 'row-card-1',
    },
  ],
} satisfies BdgAccountSegment

function mountList() {
  return shallowMount(AccountTransactionList, {
    props: {
      segments: [segment],
    },
    global: {
      stubs: {
        VIcon: true,
      },
    },
  })
}

function renderedRowKeys(wrapper: ReturnType<typeof mountList>): string[] {
  return wrapper
    .findAll('[data-testid^="account-transaction-list-row-"]')
    .map((row) => row.attributes('data-testid').replace('account-transaction-list-row-', ''))
}

describe('AccountTransactionList', () => {
  test('sorts by date descending by default while hiding duplicate rows', () => {
    const wrapper = mountList()

    expect(renderedRowKeys(wrapper)).toEqual(['row-card-1', 'row-card-2'])
  })

  test('toggles sort direction when clicking the same sortable header', async () => {
    const wrapper = mountList()

    await wrapper.get('[data-testid="account-transaction-list-sort-date"]').trigger('click')

    expect(renderedRowKeys(wrapper)).toEqual(['row-card-2', 'row-card-1'])
  })

  test('switches to amount sort and keeps duplicates filtering behavior', async () => {
    const wrapper = mountList()

    await wrapper.get('[data-testid="account-transaction-list-toggle-duplicates"]').trigger('click')
    await wrapper.get('[data-testid="account-transaction-list-sort-amount"]').trigger('click')

    expect(renderedRowKeys(wrapper)).toEqual([
      'row-card-1',
      'row-card-3-duplicate',
      'row-card-2',
    ])
  })
})
