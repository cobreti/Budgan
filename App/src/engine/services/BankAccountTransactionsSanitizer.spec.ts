import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { BankAccount } from '@engine/models/BankAccountTypes'
import { BankAccountTransactionsSanitizer } from '@engine/services/BankAccountTransactionsSanitizer'

describe('BankAccountTransactionsSanitizer', () => {
    let sanitizer: BankAccountTransactionsSanitizer

    beforeEach(async () => {
        sanitizer = new BankAccountTransactionsSanitizer()
    })

    afterEach(async () => {
        vi.resetAllMocks()
    })

    describe('initWithAccount', () => {
        test('should set accountId_', async () => {
            // Arrange
            const account: BankAccount = {
                name: 'name',
                accountId: 'accountId',
                accountType: 'accountType',
                transactionsGroups: [],
                transactions: []
            }

            // Act
            sanitizer.initWithAccount(account)

            // Assert
            expect(sanitizer.accountId).toBe('accountId')
            expect(sanitizer.transactionsGroups).toEqual([])
            expect(sanitizer.transactionsIds).toEqual({})
        })

        test('should throw error if accountId_ is already set', async () => {
            // Arrange
            const account: BankAccount = {
                name: 'name',
                accountId: 'accountId',
                accountType: 'accountType',
                transactionsGroups: [],
                transactions: []
            }

            // Act
            sanitizer.accountId = 'otheraccountId'

            // Assert
            expect(() => sanitizer.initWithAccount(account)).toThrowError(
                'Account already initialized'
            )
        })
    })
})
