import { beforeEach, describe, expect, test, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import AccountView from './account.vue'

const push = vi.fn()
const route = {
  name: 'account-statements' as unknown,
  params: {
    locale: 'fr' as unknown,
    accountId: 'acc-1' as unknown,
  },
}

const importSegment = vi.fn()

const workspaceStore = {
  workspace: {
    accounts: [
      {
        id: 'acc-1',
        name: 'Main account',
        columnMappingId: 'mapping-1',
        segments: [],
      },
    ],
  },
  importSegment,
}

vi.mock('vue-router', () => ({
  RouterView: {
    template: '<div />',
  },
  useRoute: () => route,
  useRouter: () => ({ push }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'account.importSuccess') return `Statement imported: ${params?.name}`
      if (key === 'account.importSuccessMultiple') return `${params?.n} statements imported`
      if (key === 'account.importErrorMultiple') {
        return `Failed to import ${params?.n} files: ${params?.files}`
      }
      return key
    },
  }),
}))

vi.mock('@budgan/stores/workspace-store.ts', () => ({
  useWorkspaceStore: () => workspaceStore,
}))

function mountView() {
  return shallowMount(AccountView, {
    global: {
      stubs: {
        VIcon: true,
      },
    },
  })
}

function setSelectedFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  })
}

describe('AccountView', () => {
  beforeEach(() => {
    importSegment.mockReset()
    push.mockReset()
    route.name = 'account-statements'
    route.params.locale = 'fr'
    route.params.accountId = 'acc-1'
  })

  test('allows selecting multiple CSV files', () => {
    const wrapper = mountView()
    const fileInput = wrapper.get('[data-testid="account-view-file-input"]')

    expect(fileInput.attributes('multiple')).toBeDefined()
  })

  test('imports multiple files and renders aggregated success feedback', async () => {
    const wrapper = mountView()
    const fileInput = wrapper.get('[data-testid="account-view-file-input"]')
    const januaryFile = new File(['a'], 'january.csv', { type: 'text/csv' })
    const februaryFile = new File(['b'], 'february.csv', { type: 'text/csv' })

    importSegment
      .mockResolvedValueOnce({ success: true, value: { name: 'January' } })
      .mockResolvedValueOnce({ success: true, value: { name: 'February' } })

    setSelectedFiles(fileInput.element as HTMLInputElement, [januaryFile, februaryFile])
    await fileInput.trigger('change')
    await flushPromises()

    expect(importSegment).toHaveBeenNthCalledWith(1, 'acc-1', januaryFile)
    expect(importSegment).toHaveBeenNthCalledWith(2, 'acc-1', februaryFile)
    expect(wrapper.get('[data-testid="account-view-import-success"]').text()).toBe(
      '2 statements imported',
    )
    expect(wrapper.find('[data-testid="account-view-import-error"]').exists()).toBe(false)
  })

  test('keeps successful import message and shows failed files summary on partial failures', async () => {
    const wrapper = mountView()
    const fileInput = wrapper.get('[data-testid="account-view-file-input"]')
    const januaryFile = new File(['a'], 'january.csv', { type: 'text/csv' })
    const brokenFile = new File(['b'], 'broken.csv', { type: 'text/csv' })

    importSegment
      .mockResolvedValueOnce({ success: true, value: { name: 'January' } })
      .mockResolvedValueOnce({ success: false, error: 'Invalid CSV format' })

    setSelectedFiles(fileInput.element as HTMLInputElement, [januaryFile, brokenFile])
    await fileInput.trigger('change')
    await flushPromises()

    expect(wrapper.get('[data-testid="account-view-import-success"]').text()).toBe(
      'Statement imported: January',
    )
    expect(wrapper.get('[data-testid="account-view-import-error"]').text()).toBe(
      'Failed to import 1 files: broken.csv',
    )
  })

  test('disables import button while batch import is running', async () => {
    const wrapper = mountView()
    const fileInput = wrapper.get('[data-testid="account-view-file-input"]')
    const importButton = wrapper.get('[data-testid="account-view-import-csv"]')
    const januaryFile = new File(['a'], 'january.csv', { type: 'text/csv' })

    let resolveImport: ((value: { success: true; value: { name: string } }) => void) | null = null
    importSegment.mockImplementation(
      () =>
        new Promise((resolve: (value: { success: true; value: { name: string } }) => void) => {
          resolveImport = resolve
        }),
    )

    setSelectedFiles(fileInput.element as HTMLInputElement, [januaryFile])
    const changePromise = fileInput.trigger('change')
    await flushPromises()

    expect(importButton.attributes('disabled')).toBeDefined()

    resolveImport?.({ success: true, value: { name: 'January' } })
    await changePromise
    await flushPromises()

    expect(importButton.attributes('disabled')).toBeUndefined()
  })
})
