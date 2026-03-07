import { StatementGenerator } from './core/statement-generator.ts'
import { ColumnsType } from './core/types.ts'
import { transactionDescriptions } from './data/transaction-descriptions.ts'

console.log('Statement Generator tools starting')

const [outFile] = process.argv.slice(2)

new StatementGenerator()
    .setDateRange(new Date(2024, 0, 1), new Date(2024, 2, 31))
    .setIncludeHeader(true)
    .setRandomLinesCount(10)
    .setAmountRange(10, 1000)
    .setColumns([
        ColumnsType.CARD_NUMBER,
        ColumnsType.DESCRIPTION,
        ColumnsType.DATE_TRANSACTION,
        ColumnsType.DATE_INSCRIPTION,
        ColumnsType.AMOUNT
    ])
    .generateAmounts()
    .generateRandomDates()
    .selectRandomCardNumber()
    .selectRandomDescriptions([transactionDescriptions[3].description])
    .addRecurringTransactions(
        [
            { column: ColumnsType.DESCRIPTION, value: '[PO] Netflix Subscription' },
            { column: ColumnsType.AMOUNT, value: 15.99 }
        ],
        15
    )
    .addRecurringTransactions(
        [
            { column: ColumnsType.DESCRIPTION, value: '[DD] Payroll Deposit - Acme Corp' },
            { column: ColumnsType.AMOUNT, value: 2500 }
        ],
        1
    )
    .addRecurringTransactions(
        [
            { column: ColumnsType.DESCRIPTION, value: '[FE] Monthly Maintenance Fee' },
            { column: ColumnsType.AMOUNT, value: 5.0 }
        ],
        28
    )
    .generateStatement()
    .saveStatement(outFile)
    .then(() => console.log('Statement saved successfully'))
    .catch((error) => console.error('Error generating statement:', error))
