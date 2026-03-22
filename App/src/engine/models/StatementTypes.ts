import type { BankAccount, BankAccountInvalidTransaction } from './BankAccountTypes'

export type Statement = {
    account: BankAccount
    filename: string
    startDate: Date
    endDate: Date
    numberOfTransactions: number
    duplicateTransactions: BankAccountInvalidTransaction[]
}

export type StatementsDictionary = { [key: string]: Statement }
