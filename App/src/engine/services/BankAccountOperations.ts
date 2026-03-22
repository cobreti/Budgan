import { injectable } from 'inversify'
import type { BankAccount, BankAccountTransactionsGroup } from '@models/BankAccountTypes'

export interface IBankAccountOperations {
    getTransactionsInBothAccounts(account: BankAccount, otherAccount: BankAccount): Set<string>
    removeTransactionsFromBankAccount(account: BankAccount, transactionsToRemove: Set<string>): void
    getCombinedTransactionsGroup(...accounts: BankAccount[]): BankAccountTransactionsGroup[]
    sortTransactionsGroupByStartDateAscending(
        transactionsGroup: BankAccountTransactionsGroup[]
    ): BankAccountTransactionsGroup[]
}

@injectable()
export class BankAccountOperations implements IBankAccountOperations {
    getTransactionsInBothAccounts(account: BankAccount, otherAccount: BankAccount): Set<string> {
        if (account.accountId != otherAccount.accountId) {
            throw new Error('Account Ids do not match')
        }

        // const accountTransactions = account.transactionsGroups.flatMap(
        //     (group) => group.transactions
        // )
        // const otherAccountTransactions = otherAccount.transactionsGroups.flatMap(
        //     (group) => group.transactions
        // )

        const accountTransactions = account.transactions
        const otherAccountTransactions = otherAccount.transactions

        const otherAccountTransactionsIds = new Set(
            otherAccountTransactions.map((transaction) => transaction.transactionId)
        )

        const intersection = accountTransactions
            .filter((transaction) => otherAccountTransactionsIds.has(transaction.transactionId))
            .map((transaction) => transaction.transactionId)

        return new Set(intersection)
    }

    removeTransactionsFromBankAccount(
        account: BankAccount,
        transactionsToRemove: Set<string>
    ): void {
        account.transactions = account.transactions.filter(
            (transaction) => !transactionsToRemove.has(transaction.transactionId)
        )

        // account.transactionsGroups.forEach((group) => {
        //     group.transactions = group.transactions.filter((transaction) => !transactionsToRemove.has(transaction.transactionId));
        // });
        //
        // account.transactionsGroups = account.transactionsGroups.filter((group) => group.transactions.length > 0);
    }

    getCombinedTransactionsGroup(...accounts: BankAccount[]): BankAccountTransactionsGroup[] {
        if (accounts.length == 0) {
            return []
        }

        //
        // make sure all accounts have the same accountId
        //
        const id = accounts[0].accountId

        const idx = accounts.findIndex((account) => account.accountId != id)
        if (idx != -1) {
            throw new Error('cannot combine transactions group from different accounts')
        }

        //
        // flatten transactions groups
        //
        return accounts.flatMap((account) => account.transactionsGroups)
    }

    sortTransactionsGroupByStartDateAscending(
        transactionsGroup: BankAccountTransactionsGroup[]
    ): BankAccountTransactionsGroup[] {
        return transactionsGroup.sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime())
    }
}
