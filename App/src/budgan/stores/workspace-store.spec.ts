import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceStore } from './workspace-store'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import {
  BdgWorkspaceImporter,
  type BdgWorkspaceImportResult,
} from '@engine/modules/bdg-workspace/bdg-workspace-importer'

vi.mock('@inversify/setup-inversify', () => ({
  default: { get: vi.fn() },
}))

import container from '@inversify/setup-inversify'

const importerImport = vi.fn<
  (handle: FileSystemFileHandle) => Promise<{ success: true; value: BdgWorkspaceImportResult }>
>()

function makeImportResult(): BdgWorkspaceImportResult {
  return {
    workspace: {
      id: 'ws-1',
      name: 'Loaded Workspace',
      accounts: [],
    } as unknown as BdgWorkspaceImportResult['workspace'],
    columnMappings: [],
    csvSources: [],
  }
}

function makeWorkspace(accountIds: string[]): BdgWorkspace {
  const accounts = accountIds.map((accountId) => ({
    id: accountId,
    name: `Account ${accountId}`,
    columnMappingId: 'mapping-1',
    segments: [],
  }))

  return {
    id: 'ws-1',
    name: 'Loaded Workspace',
    get accounts() {
      return accounts
    },
    createAccount: vi.fn(),
    getAccount: vi.fn(),
    loadAccount: vi.fn(),
    removeAccount(accountId: string) {
      const accountIndex = accounts.findIndex((account) => account.id === accountId)
      if (accountIndex >= 0) {
        accounts.splice(accountIndex, 1)
      }
    },
  } as unknown as BdgWorkspace
}

describe('useWorkspaceStore — load workspace picker fallback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()

    importerImport.mockResolvedValue({
      success: true,
      value: makeImportResult(),
    })

    vi.mocked(container.get).mockImplementation((bindingTypeId: string) => {
      if (bindingTypeId === BdgWorkspaceFactory.bindingTypeId) {
        return {
          createWorkspace: vi.fn(),
          reconstructWorkspace: vi.fn(),
        }
      }

      if (bindingTypeId === BdgWorkspaceImporter.bindingTypeId) {
        return {
          import: importerImport,
        }
      }

      throw new Error(`Unexpected container binding: ${bindingTypeId}`)
    })
  })

  test('uses showOpenFilePicker when available', async () => {
    const pickedHandle = {
      name: 'workspace.bdg',
      getFile: vi.fn(),
    } as unknown as FileSystemFileHandle

    const showOpenFilePicker = vi.fn().mockResolvedValue([pickedHandle])
    ;(window as Window & typeof globalThis & {
      showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>
    }).showOpenFilePicker = showOpenFilePicker

    const store = useWorkspaceStore()
    const result = await store.loadWorkspace()

    expect(result.success).toBe(true)
    expect(showOpenFilePicker).toHaveBeenCalledTimes(1)
    expect(importerImport).toHaveBeenCalledWith(pickedHandle)
  })

  test('falls back to input file picker when showOpenFilePicker is unavailable', async () => {
    delete (window as Window & typeof globalThis & {
      showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>
    }).showOpenFilePicker

    const selectedFile = new File(['zip-content'], 'fallback-workspace.bdg', {
      type: 'application/zip',
    })

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function click(this: HTMLInputElement) {
        Object.defineProperty(this, 'files', {
          configurable: true,
          value: [selectedFile],
        })
        this.dispatchEvent(new Event('change'))
      })

    const store = useWorkspaceStore()
    const result = await store.loadWorkspace()

    expect(result.success).toBe(true)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(importerImport).toHaveBeenCalledTimes(1)

    const fallbackHandle = importerImport.mock.calls[0][0]
    const file = await fallbackHandle.getFile()
    expect(file.name).toBe('fallback-workspace.bdg')
  })

  test('returns cancelled result when fallback picker is closed without selecting a file', async () => {
    delete (window as Window & typeof globalThis & {
      showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>
    }).showOpenFilePicker

    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function click(this: HTMLInputElement) {
      Object.defineProperty(this, 'files', {
        configurable: true,
        value: [],
      })
      this.dispatchEvent(new Event('change'))
    })

    const store = useWorkspaceStore()
    const result = await store.loadWorkspace()

    expect(result.success).toBe(false)
    expect(importerImport).not.toHaveBeenCalled()
  })
})

describe('useWorkspaceStore — removeAccount', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()

    vi.mocked(container.get).mockImplementation((bindingTypeId: string) => {
      if (bindingTypeId === BdgWorkspaceFactory.bindingTypeId) {
        return {
          createWorkspace: vi.fn(),
          reconstructWorkspace: vi.fn(),
        }
      }

      if (bindingTypeId === BdgWorkspaceImporter.bindingTypeId) {
        return {
          import: importerImport,
        }
      }

      throw new Error(`Unexpected container binding: ${bindingTypeId}`)
    })
  })

  test('removes account from workspace and syncs snapshot', () => {
    const store = useWorkspaceStore()
    store.setWorkspace(makeWorkspace(['acc-1', 'acc-2']))

    store.removeAccount('acc-1')

    expect(store.workspace?.accounts.map((account) => account.id)).toEqual(['acc-2'])
    expect(store.$state.workspaceSnapshot?.accounts.map((account) => account.id)).toEqual(['acc-2'])
  })

  test('does nothing when no workspace is loaded', () => {
    const store = useWorkspaceStore()

    expect(() => store.removeAccount('acc-1')).not.toThrow()
    expect(store.$state.workspaceSnapshot).toBeNull()
  })
})
