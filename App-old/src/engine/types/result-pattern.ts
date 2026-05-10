export type Result<T> = { success: true; value: T } | { success: false }
export type ResultWithError<T, E> = { success: true; value: T } | { success: false; error?: E }
