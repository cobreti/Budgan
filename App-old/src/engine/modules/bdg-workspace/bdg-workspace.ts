import type { IdGenerator } from '@engine/services/IdGenerator'
import { BdgAccountImpl, type BdgAccount } from './bdg-account'
import type { Result } from '@engine/types/result-pattern'
import { BdgSettingsImpl, type BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import type { BdgStorageService } from '@engine/modules/bdg-storage/bdg-storage.services.ts'

export interface BdgWorkspace {
  id: string
  name: string
  settings: BdgSettings
  accounts: BdgAccount[]
  createAccount(name: string, columnMappingId: string): BdgAccount
  getAccount(accountId: string): Result<BdgAccount> | undefined
  loadAccount(account: BdgAccount): void
  removeAccount(accountId: string): void
}

export class BdgWorkspaceImpl implements BdgWorkspace {
  private _idGenerator: IdGenerator
  private readonly _id: string
  private _accounts: { [key: string]: BdgAccount } = {}
  private _name: string = ''
  private _settings: BdgSettings
  private _storageService: BdgStorageService

  constructor(idGenerator: IdGenerator, storageService: BdgStorageService, id: string) {
    this._id = id
    this._idGenerator = idGenerator
    this._storageService = storageService

    this._settings = new BdgSettingsImpl(this._id, this._storageService.getSettingsService())
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get settings(): BdgSettings {
    return this._settings
  }

  get accounts(): BdgAccount[] {
    return Object.values(this._accounts)
  }

  set name(value: string) {
    this._name = value
  }

  createAccount(name: string, columnMappingId: string): BdgAccount {
    const accountId = this._idGenerator.generateId()
    const account = new BdgAccountImpl(accountId, name, columnMappingId)
    this._accounts[accountId] = account
    return account
  }

  getAccount(accountId: string): Result<BdgAccount> {
    const account = this._accounts[accountId]
    return account ? { success: true, value: account } : { success: false }
  }

  loadAccount(account: BdgAccount): void {
    this._accounts[account.id] = account
  }

  removeAccount(accountId: string): void {
    delete this._accounts[accountId]
  }
}
