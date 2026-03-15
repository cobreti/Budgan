import 'reflect-metadata'

import { injectable } from 'inversify'
import type {
    BankAccount,
    BankAccountTransaction,
    BankAccountTransactionsGroup,
    TransactionIdsTable
} from '@engine/models/BankAccountTypes'

export interface IBankAccountTransactionsSanitizer {
    initWithAccount(account: BankAccount): void
    getTransactionsIdsForAccount(account: BankAccount): TransactionIdsTable
    addTransactions(transactions: BankAccountTransaction[]): void
    addTransactionsGroup(group: BankAccountTransactionsGroup): void

    get transactionsGroups(): BankAccountTransactionsGroup[]
    get transactions(): BankAccountTransaction[]
}

@injectable()
export class BankAccountTransactionsSanitizer implements IBankAccountTransactionsSanitizer {
    public accountId: string | undefined
    public transactionsIds: TransactionIdsTable = {}
    public transactionsGroups: BankAccountTransactionsGroup[] = []
    public rejectedGroups: BankAccountTransactionsGroup[] = []
    public transactions: BankAccountTransaction[] = []
    public rejectedTransactions: BankAccountTransaction[] = []

    public initWithAccount(account: BankAccount): void {
        if (this.accountId != undefined) {
            throw new Error('Account already initialized')
        }

        this.accountId = account.accountId
        this.transactionsIds = this.getTransactionsIdsForAccount(account)
    }

    public getTransactionsIdsForAccount(account: BankAccount): TransactionIdsTable {
        return account.transactions.reduce((acc, transaction) => {
            acc[transaction.transactionId] = {}
            return acc
        }, {} as TransactionIdsTable)
    }

    public addTransactions(transactions: BankAccountTransaction[]): void {
        for (const transaction of transactions) {
            if (this.transactionsIds[transaction.transactionId]) {
                this.rejectedTransactions.push(transaction)
            } else {
                this.transactions.push(transaction)
                this.transactionsIds[transaction.transactionId] = {}
            }
        }
    }

    public addTransactionsGroup(group: BankAccountTransactionsGroup): void {
        //
        // check if group already added first
        //

        const groupIdx = this.transactionsGroups.findIndex((g) => g.id === group.id)
        if (groupIdx >= 0) {
            this.rejectedGroups.push(group)
            return
        }

        //
        // check if group contains duplicated transactions
        //  and add the groups list
        //

        const newGroup: BankAccountTransactionsGroup = {
            ...group,
            invalidTransactions: []
        }

        this.transactionsGroups.push(newGroup)
    }
}
