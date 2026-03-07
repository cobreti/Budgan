export const enum ColumnsType {
    CARD_NUMBER = 1,
    DATE_INSCRIPTION = 2,
    DATE_TRANSACTION = 3,
    AMOUNT = 4,
    DESCRIPTION = 5,
    TYPE = 6
}

export const ColumnHeaders: Record<ColumnsType, string> = {
    [ColumnsType.CARD_NUMBER]: 'CARD_NUMBER',
    [ColumnsType.DATE_INSCRIPTION]: 'DATE_INSCRIPTION',
    [ColumnsType.DATE_TRANSACTION]: 'DATE_TRANSACTION',
    [ColumnsType.AMOUNT]: 'AMOUNT',
    [ColumnsType.DESCRIPTION]: 'DESCRIPTION',
    [ColumnsType.TYPE]: 'TYPE'
}

export type StatementByColumns = { [key in ColumnsType]?: string[] };

// Centralized shared types for the Statement Generator
/**
 * Indicates how a transaction amount should affect the balance.
 * - Income: money coming in; amounts are treated as positive in generated statements.
 * - Expanse: money going out (purchase, fee, withdrawal, payment); amounts are treated as negative in generated statements.
 *
 * Note: This enum is used by generateStatement to set the sign of the AMOUNT column.
 */
export enum AmountOperationType {
    Income,
    Expanse
}

/**
 * Metadata describing a transaction line used to generate sample statements.
 * - description: Human-readable label that appears in the DESCRIPTION column.
 * - type: A coarse transaction category (for example, "Purchase", "Direct Deposit", "Fee").
 * - amountOperationType: Controls the sign of the amount (see AmountOperationType).
 */
export type TransactionDescription = {
    description: string
    type: string
    amountOperationType: AmountOperationType
}
