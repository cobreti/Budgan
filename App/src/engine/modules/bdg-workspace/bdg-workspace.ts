import type { IdGenerator } from '@/engine/services/IdGenerator'
import { BdgAccountImpl, type BdgAccount } from './bdg-account'
import type { Result } from '@/engine/types/result-pattern'

export interface BdgWorkspace {
  id: string
  createAccount(): BdgAccount
  getAccount(accountId: string): BdgAccount | undefined
}

export class BdgWorkspaceImpl implements BdgWorkspace {
  private _idGenerator: IdGenerator
  private _id: string
  private _accounts: Map<string, BdgAccount> = new Map()

  constructor(idGenerrator: IdGenerator, id: string) {
    this._id = id
    this._idGenerator = idGenerrator
  }

  get id(): string {
    return this._id
  }

  createAccount(): BdgAccount {
    const accountId = this._idGenerator.generateId()
    const account = new BdgAccountImpl(accountId)
    this._accounts.set(accountId, account)
    return account
  }

  getAccount(accountId: string): Result<BdgAccount> {
    const account = this._accounts.get(accountId)
    return account ? { success: true, value: account } : { success: false }
  }
}
