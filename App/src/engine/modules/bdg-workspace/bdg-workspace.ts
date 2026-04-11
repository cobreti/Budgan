import type { IdGenerator } from '@engine/services/IdGenerator'
import { BdgAccountImpl, type BdgAccount } from './bdg-account'
import type { Result } from '@engine/types/result-pattern'

export interface BdgWorkspace {
  id: string
  name: string
  accounts: BdgAccount[]
  createAccount(name: string, columnMappingId: string): BdgAccount
  getAccount(accountId: string): Result<BdgAccount> | undefined
  loadAccount(account: BdgAccount): void
  removeAccount(accountId: string): void
}

export class BdgWorkspaceImpl implements BdgWorkspace {
  private _idGenerator: IdGenerator
  private readonly _id: string
  private _accounts: Map<string, BdgAccount> = new Map()
  private _name: string = ''

  constructor(idGenerator: IdGenerator, id: string) {
    this._id = id
    this._idGenerator = idGenerator
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get accounts(): BdgAccount[] {
    return Array.from(this._accounts.values())
  }

  set name(value: string) {
    this._name = value
  }

  createAccount(name: string, columnMappingId: string): BdgAccount {
    const accountId = this._idGenerator.generateId()
    const account = new BdgAccountImpl(accountId, name, columnMappingId)
    this._accounts.set(accountId, account)
    return account
  }

  getAccount(accountId: string): Result<BdgAccount> {
    const account = this._accounts.get(accountId)
    return account ? { success: true, value: account } : { success: false }
  }

  loadAccount(account: BdgAccount): void {
    this._accounts.set(account.id, account)
  }

  removeAccount(accountId: string): void {
    this._accounts.delete(accountId)
  }
}
