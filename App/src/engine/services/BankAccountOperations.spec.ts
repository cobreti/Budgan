import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import '@/core/setupInversify'
import { BankAccountOperations } from './BankAccountOperations'
import type { BankAccount } from '@models/BankAccountTypes'

describe('BankAccountOperations', () => {
    let bankAccountOperationService = new BankAccountOperations()

    beforeEach(async () => {
        bankAccountOperationService = new BankAccountOperations()
    })

    afterEach(async () => {
        vi.resetAllMocks()
    })

    describe('getTransactionsInBothAccounts', () => {
        test('getTransactionsInBothAccounts success', () => {
            const startDate = new Date()
            const endDate = new Date(startDate.getDate() + 1)
            const dateInscription = new Date()

            const account1: BankAccount = {
                accountId: '1',
                name: 'Account 1',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '1',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '2',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '3',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            }

            const account2: BankAccount = {
                accountId: '1',
                name: 'Account 2',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '1',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '3',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '4',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            }

            const result = bankAccountOperationService.getTransactionsInBothAccounts(
                account1,
                account2
            )

            expect(result).toEqual(new Set(['1', '3']))
        })

        test('account id does not match', () => {
            const startDate = new Date()
            const endDate = new Date(startDate.getDate() + 1)
            const dateInscription = new Date()

            const account1: BankAccount = {
                accountId: '1',
                name: 'Account 1',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '1',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '2',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '3',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            }

            const account2: BankAccount = {
                accountId: '2',
                name: 'Account 2',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '1',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '3',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '4',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            }

            expect(() =>
                bankAccountOperationService.getTransactionsInBothAccounts(account1, account2)
            ).toThrowError('Account Ids do not match')
        })
    })

    describe('removeTransactionsFromBankAccount', () => {
        test('removeTransactionsFromBankAccount success', () => {
            const startDate = new Date()
            const endDate = new Date(startDate.getDate() + 1)
            const dateInscription = new Date()

            const account: BankAccount = {
                accountId: '1',
                name: 'Account 1',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '1',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '2',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    },
                    {
                        transactionId: '3',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            }

            const transactionsToRemove = new Set(['1', '3'])

            bankAccountOperationService.removeTransactionsFromBankAccount(
                account,
                transactionsToRemove
            )

            expect(account).toEqual({
                accountId: '1',
                name: 'Account 1',
                accountType: 'Checking',
                transactions: [
                    {
                        transactionId: '2',
                        transactionGroupId: '1',
                        dateInscription: dateInscription,
                        amount: 100,
                        type: 'Deposit',
                        description: 'Deposit'
                    }
                ],
                transactionsGroups: [
                    {
                        name: 'Group 1',
                        id: '1',
                        dateStart: startDate,
                        dateEnd: endDate
                    }
                ]
            })
        })
    })
})
