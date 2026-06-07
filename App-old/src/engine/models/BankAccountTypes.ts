/**
 * Defines transaction Ids table.
 *
 * Using key to store ids and an empty object assigned to this id
 * so it can be saved and restored automatically from browser session storage.
 *
 */
export declare type TransactionIdsTable = { [key: string]: object }

export type BankAccountTransaction = {
    transactionId: string
    transactionGroupId: string
    dateInscription: Date
    dateTransaction?: Date
    amount: number
    type: string
    description: string
}

export enum InvalidTransactionReason {
    // eslint-disable-next-line no-unused-vars
    unknown = 'unknown',
    // eslint-disable-next-line no-unused-vars
    duplicate = 'duplicate'
}

export type BankAccountInvalidTransaction = BankAccountTransaction & {
    invalidReason: InvalidTransactionReason
}

export type BankAccountTransactionsGroup = {
    name: string
    filename?: string
    id: string
    dateStart: Date
    dateEnd: Date
    invalidTransactions?: BankAccountInvalidTransaction[]
}

export type BankAccount = {
    name: string
    accountId: string
    accountType: string | undefined
    transactionsGroups: BankAccountTransactionsGroup[]
    transactions: BankAccountTransaction[]
    csvSettingId?: string
}

export type BankAccountsDictionary = { [key: string]: BankAccount }
