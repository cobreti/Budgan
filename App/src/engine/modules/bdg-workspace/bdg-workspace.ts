import type { IdGenerator } from '@/engine/services/IdGenerator'
import { BdgAccountImpl, type BdgAccount } from './bdg-account'
import type { Result } from '@/engine/types/result-pattern'

export interface BdgWorkspace {
  id: string
  name: string
  createAccount(name: string): BdgAccount
  getAccount(accountId: string): BdgAccount | undefined
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

  set name(value: string) {
    this._name = value
  }

  createAccount(name: string): BdgAccount {
    const accountId = this._idGenerator.generateId()
    const account = new BdgAccountImpl(accountId, name)
    this._accounts.set(accountId, account)
    return account
  }

  getAccount(accountId: string): Result<BdgAccount> {
    const account = this._accounts.get(accountId)
    return account ? { success: true, value: account } : { success: false }
  }
}
