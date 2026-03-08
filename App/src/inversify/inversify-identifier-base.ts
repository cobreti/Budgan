

/**
 * This file defines the base classes and interfaces for type-safe Inversify lookups.
 * It provides a common base for all services that want to be retrieved from the
 * container using their class constructor instead of string literals.
 */

export interface InversifyIdentifierBaseConstructor<T extends InversifyIdentifierBase = InversifyIdentifierBase> {
    new(...args: any[]): T;
    readonly bindingId: string;
}

export abstract class InversifyIdentifierBase {}
